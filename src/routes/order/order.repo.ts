import { Injectable } from '@nestjs/common'
import { OrderStatus, Prisma } from '@prisma/client'
import {
	CannotCancelOrderException,
	NotFoundCartItemException,
	OrderNotFoundException,
	OutOfStockSKUException,
	ProductNotFoundException,
} from 'src/routes/order/order.error'
import {
	CancelOrderResType,
	CreateOrderBodyType,
	CreateOrderResType,
	GetOrderDetailResType,
	GetOrderListQueryType,
	GetOrderListResType,
} from 'src/routes/order/order.model'
import { OrderProducer } from 'src/routes/order/order.producer'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class OrderRepo {
	constructor(
		private readonly prismaService: PrismaService,
		private orderProducer: OrderProducer,
	) {}
	async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
		const { page, limit, status } = query
		const skip = (page - 1) * limit
		const take = limit
		const where: Prisma.OrderWhereInput = {
			userId,
			status,
		}

		// Đếm tổng số order
		const totalItem$ = this.prismaService.order.count({
			where,
		})
		// Lấy list order
		const data$ = await this.prismaService.order.findMany({
			where,
			include: {
				items: true,
			},
			skip,
			take,
			orderBy: {
				createdAt: 'desc',
			},
		})
		const [data, totalItems] = await Promise.all([data$, totalItem$])
		return {
			data,
			page,
			limit,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
		}
	}

	async create(
		userId: number,
		body: CreateOrderBodyType,
	): Promise<{
		paymentId: number
		orders: CreateOrderResType['orders']
	}> {
		const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat()
		const cartItems = await this.prismaService.cartItem.findMany({
			where: {
				id: {
					in: allBodyCartItemIds,
				},
				userId,
			},
			include: {
				sku: {
					include: {
						product: true,
					},
				},
			},
		})

		// 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
		if (cartItems.length !== allBodyCartItemIds.length) {
			throw NotFoundCartItemException
		}

		// 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
		const isOutOfStock = cartItems.some((item) => item.sku.stock < item.quantity)
		if (isOutOfStock) {
			throw OutOfStockSKUException
		}

		// 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
		const isExistNotReadyProduct = cartItems.some((item) => item.sku.product.deletedAt !== null)
		if (isExistNotReadyProduct) {
			throw ProductNotFoundException
		}

		// 4. Tạo order và xóa cartItem trong transaction để đảm bảo tính toàn vẹn dữ liệu
		const [paymentId, orders] = await this.prismaService.$transaction(async (tx) => {
			const payment = await tx.payment.create({
				data: {
					status: PaymentStatus.PENDING,
				},
			})
			const orders$ = Promise.all(
				body.map((item) =>
					tx.order.create({
						data: {
							userId,
							status: OrderStatus.PENDING_PAYMENT,
							receiver: item.receiver,
							createdById: userId,
							paymentId: payment.id,
							items: {
								create: item.cartItemIds.map((cartItemId) => {
									const cartItem = cartItems.find((ci) => ci.id === cartItemId)
									if (!cartItem) {
										throw new Error(`CartItem with ID ${cartItemId} not found`)
									}
									return {
										productName: cartItem.sku.product.name,
										skuPrice: cartItem.sku.price,
										image: cartItem.sku.image,
										skuId: cartItem.sku.id,
										skuValue: cartItem.sku.value,
										quantity: cartItem.quantity,
										productId: cartItem.sku.product.id,
									}
								}),
							},
							products: {
								connect: item.cartItemIds.map((cartItemId) => {
									const cartItem = cartItems.find((ci) => ci.id === cartItemId)
									if (!cartItem) {
										throw new Error(`CartItem with ID ${cartItemId} not found`)
									}
									return {
										id: cartItem.sku.product.id,
									}
								}),
							},
						},
					}),
				),
			)
			console.log('orders', orders$)

			const cartItem$ = await tx.cartItem.deleteMany({
				where: {
					id: {
						in: allBodyCartItemIds,
					},
				},
			})

			const sku$ = Promise.all(
				cartItems.map((item) =>
					tx.sKU.update({
						where: {
							id: item.sku.id,
						},
						data: {
							stock: {
								decrement: item.quantity,
							},
						},
					}),
				),
			)

			const addCancelPaymentJob$ = this.orderProducer.addCancelPaymentJob(payment.id)
			const [orders] = await Promise.all([orders$, cartItem$, sku$, addCancelPaymentJob$])
			return [payment.id, orders]
		})

		return {
			orders,
			paymentId,
		}
	}
	async detail(userId: number, orderid: number): Promise<GetOrderDetailResType> {
		const order = await this.prismaService.order.findUnique({
			where: {
				id: orderid,
				userId,
				deletedAt: null,
			},
			include: {
				items: true,
			},
		})
		if (!order) {
			throw OrderNotFoundException
		}
		return order
	}

	async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
		try {
			const order = await this.prismaService.order.findUniqueOrThrow({
				where: {
					id: orderId,
					userId,
					deletedAt: null,
				},
			})
			if (order.status !== OrderStatus.PENDING_PAYMENT) {
				throw CannotCancelOrderException
			}
			const updatedOrder = await this.prismaService.order.update({
				where: {
					id: orderId,
					userId,
					deletedAt: null,
				},
				data: {
					status: OrderStatus.CANCELLED,
					updatedById: userId,
				},
			})
			return updatedOrder
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw OrderNotFoundException
			}
			throw error
		}
	}
}
