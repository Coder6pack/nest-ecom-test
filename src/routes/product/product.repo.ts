import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
	CreateProductBodyType,
	GetProductDetailResType,
	GetProductsQueryType,
	GetProductsResType,
	UpdateProductBodyType,
} from 'src/routes/product/product.model'
import { ALL_LANGUAGE_CODE, OrderByType, SortBy, SortByType } from 'src/shared/constants/other.constant'
import { ProductType } from 'src/shared/models/shared-product.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ProductRepo {
	constructor(private readonly prismaService: PrismaService) {}

	async list({
		limit,
		page,
		name,
		brandIds,
		categories,
		minPrice,
		maxPrice,
		orderBy,
		sortBy,
	}: {
		limit: number
		page: number
		name?: string
		brandIds?: number[]
		categories?: number[]
		minPrice?: number
		maxPrice?: number
		orderBy: OrderByType
		sortBy: SortByType
	}): Promise<GetProductsResType> {
		const skip = (page - 1) * limit
		const take = limit
		// eslint-disable-next-line prefer-const
		let where: Prisma.ProductWhereInput = {
			deletedAt: null,
		}
		if (name) {
			where.name = {
				contains: name,
				mode: 'insensitive',
			}
		}
		if (brandIds && brandIds.length > 0) {
			where.brandId = {
				in: brandIds,
			}
		}
		if (categories && categories.length > 0) {
			where.categories = {
				some: {
					id: {
						in: categories,
					},
				},
			}
		}
		if (minPrice !== undefined || maxPrice !== undefined) {
			where.basePrice = {
				...(minPrice !== undefined && { gte: minPrice }),
				...(maxPrice !== undefined && { lte: maxPrice }),
			}
		}
		// Mặc định sort theo createdAt mới nhất
		let caculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
			createdAt: orderBy,
		}
		if (sortBy === SortBy.Price) {
			caculatedOrderBy = {
				basePrice: orderBy,
			}
		} else if (sortBy === SortBy.Sale) {
			caculatedOrderBy = {
				orders: {
					_count: orderBy,
				},
			}
		}
		const [totalItems, data] = await Promise.all([
			this.prismaService.product.count({
				where,
			}),
			this.prismaService.product.findMany({
				where,
				include: {
					orders: {
						where: {
							deletedAt: null,
							status: 'DELIVERED',
						},
					},
				},
				orderBy: caculatedOrderBy,
				skip,
				take,
			}),
		])
		return {
			data,
			totalItems,
			page: page,
			limit: limit,
			totalPages: Math.ceil(totalItems / limit),
		}
	}

	findById(productId: number): Promise<ProductType | null> {
		return this.prismaService.product.findUnique({
			where: {
				id: productId,
				deletedAt: null,
			},
		})
	}

	getDetail(productId: number): Promise<GetProductDetailResType | null> {
		// eslint-disable-next-line prefer-const
		let where: Prisma.ProductWhereUniqueInput = {
			id: productId,
			deletedAt: null,
		}
		return this.prismaService.product.findUnique({
			where,
			include: {
				skus: true,
				brand: true,
				categories: true,
			},
		})
	}

	create({
		createdById,
		data,
	}: {
		createdById: number
		data: CreateProductBodyType
	}): Promise<GetProductDetailResType> {
		const { skus, categories, ...productData } = data
		return this.prismaService.product.create({
			data: {
				createdById,
				...productData,
				categories: {
					connect: categories.map((category) => ({ id: category })),
				},
				skus: {
					createMany: {
						data: skus.map((sku) => ({
							...sku,
							createdById,
						})),
					},
				},
			},
			include: {
				skus: {
					where: { deletedAt: null },
				},
				brand: true,
				categories: {
					where: {
						deletedAt: null,
					},
				},
			},
		})
	}

	async update({
		id,
		updatedById,
		data,
	}: {
		id: number
		updatedById: number
		data: UpdateProductBodyType
	}): Promise<ProductType> {
		const { skus: dataSkus, categories, ...productData } = data
		// SKU đã tồn tại trong DB nhưng không có trong data payload thì sẽ bị xóa
		// SKU đã tồn tại trong DB nhưng có trong data payload thì sẽ được cập nhật
		// SKY không tồn tại trong DB nhưng có trong data payload thì sẽ được thêm mới

		// 1. Lấy danh sách SKU hiện tại trong DB
		const existingSKUs = await this.prismaService.sKU.findMany({
			where: {
				productId: id,
				deletedAt: null,
			},
		})

		// 2. Tìm các SKUs cần xóa (tồn tại trong DB nhưng không có trong data payload)
		const skusToDelete = existingSKUs.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
		const skuIdsToDelete = skusToDelete.map((sku) => sku.id)

		// 3. Mapping ID vào trong data payload
		const skusWithId = dataSkus.map((dataSku) => {
			const existingSku = existingSKUs.find((existingSKU) => existingSKU.value === dataSku.value)
			return {
				...dataSku,
				id: existingSku ? existingSku.id : null,
			}
		})

		// 4. Tìm các skus để cập nhật
		const skusToUpdate = skusWithId.filter((sku) => sku.id !== null)

		// 5. Tìm các skus để thêm mới
		const skusToCreate = skusWithId
			.filter((sku) => sku.id === null)
			.map((sku) => {
				const { id: skuId, ...data } = sku
				return {
					...data,
					productId: id,
					createdById: updatedById,
				}
			})
		const [product] = await this.prismaService.$transaction([
			// Cập nhật Product
			this.prismaService.product.update({
				where: {
					id,
					deletedAt: null,
				},
				data: {
					...productData,
					updatedById,
					categories: {
						connect: categories.map((category) => ({ id: category })),
					},
				},
			}),
			// Xóa mềm các SKU không có trong data payload
			this.prismaService.sKU.updateMany({
				where: {
					id: {
						in: skuIdsToDelete,
					},
				},
				data: {
					deletedAt: new Date(),
					deletedById: updatedById,
				},
			}),
			// Cập nhật các SKU có trong data payload
			...skusToUpdate.map((sku) =>
				this.prismaService.sKU.update({
					where: {
						id: sku.id as number,
					},
					data: {
						value: sku.value,
						price: sku.price,
						stock: sku.stock,
						image: sku.image,
						updatedById,
					},
				}),
			),
			// Thêm mới các SKU không có trong DB
			this.prismaService.sKU.createMany({
				data: skusToCreate,
			}),
		])

		return product
	}
	async delete(
		{
			id,
			deletedById,
		}: {
			id: number
			deletedById: number
		},
		isHard?: boolean,
	): Promise<ProductType> {
		if (isHard) {
			const [product] = await Promise.all([
				this.prismaService.product.delete({
					where: {
						id,
					},
				}),
				this.prismaService.sKU.deleteMany({
					where: {
						productId: id,
					},
				}),
			])
			return product
		}
		const now = new Date()
		const [product] = await Promise.all([
			this.prismaService.product.update({
				where: {
					id,
					deletedAt: null,
				},
				data: {
					deletedAt: now,
					deletedById,
				},
			}),
			this.prismaService.sKU.updateMany({
				where: {
					productId: id,
					deletedAt: null,
				},
				data: {
					deletedAt: now,
					deletedById,
				},
			}),
		])
		return product
	}
}
