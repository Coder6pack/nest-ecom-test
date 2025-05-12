import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
	InvalidQuantityException,
	NotFoundCartItemException,
	NotFoundSKUException,
	OutOfStockSKUException,
	ProductNotFoundException,
} from 'src/routes/cart/cart.error'
import {
	AddToCartBodyType,
	CartItemDetailType,
	CartItemType,
	DeleteCartBodyType,
	GetCartResType,
	UpdateCartItemBodyType,
} from 'src/routes/cart/cart.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { SKUSchemaType } from 'src/shared/models/shared-sku.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CartRepo {
	constructor(private readonly prismaService: PrismaService) {}

	private async validateSKU({
		skuId,
		quantity,
		userId,
		isCreate,
	}: {
		skuId: number
		quantity: number
		userId: number
		isCreate: boolean
	}): Promise<SKUSchemaType> {
		const [cartItem, sku] = await Promise.all([
			this.prismaService.cartItem.findUnique({
				where: {
					userId_skuId: {
						userId,
						skuId,
					},
				},
			}),
			this.prismaService.sKU.findUnique({
				where: { id: skuId, deletedAt: null },
				include: {
					product: true,
				},
			}),
		])
		// Kiểm tra tồn tại của SKU
		if (!sku) {
			throw NotFoundSKUException
		}
		if (cartItem && isCreate && quantity + cartItem.quantity > sku.stock) {
			throw InvalidQuantityException
		}
		// Kiểm tra lượng hàng còn lại
		if (sku.stock < 1 || sku.stock < quantity) {
			throw OutOfStockSKUException
		}
		const { product } = sku

		// Kiểm tra sản phẩm đã bị xóa hoặc có công khai hay không
		if (product.deletedAt !== null) {
			throw ProductNotFoundException
		}
		return sku
	}

	async list({ userId, page, limit }: { userId: number; limit: number; page: number }): Promise<GetCartResType> {
		const cartItems = await this.prismaService.cartItem.findMany({
			where: {
				userId,
				sku: {
					product: {
						deletedAt: null,
					},
				},
			},
			include: {
				sku: {
					include: {
						product: true,
					},
				},
			},
			orderBy: {
				updatedAt: 'desc',
			},
		})
		const groupMap = new Map<number, CartItemDetailType>()
		const sortedGroups = Array.from(groupMap.values())
		const skip = (page - 1) * limit
		const take = limit
		const totalGroups = sortedGroups.length
		const pagedGroups = sortedGroups.slice(skip, skip + take)
		return {
			data: pagedGroups,
			totalItems: totalGroups,
			limit,
			page,
			totalPages: Math.ceil(totalGroups / limit),
		}
	}

	async list2({ userId, page, limit }: { userId: number; limit: number; page: number }): Promise<GetCartResType> {
		const skip = (page - 1) * limit
		const take = limit
		// Đếm tổng số nhóm sản phẩm
		const totalItems$ = this.prismaService.$queryRaw<{ createdById: number }[]>`
  SELECT DISTINCT
    "Product"."createdById"
  FROM "CartItem"
  JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
  JOIN "Product" ON "SKU"."productId" = "Product"."id"
  WHERE "CartItem"."userId" = ${userId}
    AND "Product"."deletedAt" IS NULL
`

		const data$ = await this.prismaService.$queryRaw<CartItemDetailType[]>(
			Prisma.sql`
    SELECT
      "Product"."createdById",
      json_agg(
        jsonb_build_object(
          'id', "CartItem"."id",
          'quantity', "CartItem"."quantity",
          'skuId', "CartItem"."skuId",
          'userId', "CartItem"."userId",
          'createdAt', "CartItem"."createdAt",
          'updatedAt', "CartItem"."updatedAt",
          'sku', jsonb_build_object(
            'id', "SKU"."id",
            'value', "SKU"."value",
            'price', "SKU"."price",
            'stock', "SKU"."stock",
            'image', "SKU"."image",
            'productId', "SKU"."productId",
            'product', jsonb_build_object(
              'id', "Product"."id",
              'name', "Product"."name",
              'basePrice', "Product"."basePrice",
              'virtualPrice', "Product"."virtualPrice",
              'brandId', "Product"."brandId",
              'images', "Product"."images",
              'variants', "Product"."variants"
            )
          )
        ) ORDER BY "CartItem"."updatedAt" DESC
      ) AS "cartItems"
    FROM "CartItem"
    JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
    JOIN "Product" ON "SKU"."productId" = "Product"."id"
    LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
    WHERE "CartItem"."userId" = ${userId}
      AND "Product"."deletedAt" IS NULL
    GROUP BY "Product"."createdById", "User"."id"
    ORDER BY MAX("CartItem"."updatedAt") DESC
    LIMIT ${take}
    OFFSET ${skip}
  `,
		)
		const [data, totalItems] = await Promise.all([data$, totalItems$])
		return {
			data,
			page,
			limit,
			totalItems: totalItems.length,
			totalPages: Math.ceil(totalItems.length / limit),
		}
	}

	async create(userId: number, body: AddToCartBodyType): Promise<CartItemType> {
		await this.validateSKU({
			skuId: body.skuId,
			quantity: body.quantity,
			userId,
			isCreate: true,
		})

		return this.prismaService.cartItem.upsert({
			where: {
				userId_skuId: {
					userId,
					skuId: body.skuId,
				},
			},
			update: {
				quantity: {
					increment: body.quantity,
				},
			},
			create: {
				userId,
				skuId: body.skuId,
				quantity: body.quantity,
			},
		})
	}

	async update({
		userId,
		body,
		cartItemId,
	}: {
		userId: number
		cartItemId: number
		body: UpdateCartItemBodyType
	}): Promise<CartItemType> {
		await this.validateSKU({
			skuId: body.skuId,
			quantity: body.quantity,
			userId,
			isCreate: false,
		})

		return this.prismaService.cartItem
			.update({
				where: {
					id: cartItemId,
					userId,
				},
				data: {
					skuId: body.skuId,
					quantity: body.quantity,
				},
			})
			.catch((error) => {
				if (isNotFoundPrismaError(error)) {
					throw NotFoundCartItemException
				}
				throw error
			})
	}

	delete(userId: number, body: DeleteCartBodyType): Promise<{ count: number }> {
		return this.prismaService.cartItem.deleteMany({
			where: {
				id: {
					in: body.cartItemIds,
				},
				userId,
			},
		})
	}
}
