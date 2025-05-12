import { BrandSchema } from 'src/shared/models/shared-brand.model'
import { CategorySchema } from 'src/shared/models/shared-category.model'
import { VariantsSchema } from 'src/shared/models/shared-product.model'
import { SKUSchema } from 'src/shared/models/shared-sku.model'
import { z } from 'zod'
import { UpsertSKUBodySchema } from './sku.model'
import { OrderBy, SortBy } from 'src/shared/constants/other.constant'

function generateSKUs(variants: VariantsType) {
	// Hàm hỗ trợ để tạo tất cả tổ hợp
	function getCombinations(arrays: string[][]): string[] {
		return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), [''])
	}

	// Lấy mảng các options từ variants
	const options = variants.map((variant) => variant.options)

	// Tạo tất cả tổ hợp
	const combinations = getCombinations(options)

	// Chuyển tổ hợp thành SKU objects
	return combinations.map((value) => ({
		value,
		price: 0,
		stock: 100,
		image: '',
	}))
}
export const ProductSchema = z.object({
	id: z.number(),
	name: z.string().max(500),
	basePrice: z.number().positive(),
	virtualPrice: z.number().positive(),
	brandId: z.number().positive(),
	images: z.array(z.string()),
	description: z.string(),
	variants: VariantsSchema, // Json field represented as a record

	createdById: z.number().nullable(),
	updatedById: z.number().nullable(),
	deletedById: z.number().nullable(),
	deletedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const GetProductsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	name: z.string().optional(),
	brandIds: z.preprocess((value) => {
		if (typeof value === 'string') {
			return [Number(value)]
		}
		return value
	}, z.array(z.coerce.number().int().positive()).optional()),
	categories: z.array(z.coerce.number().int().positive()).optional(),
	minPrice: z.coerce.number().positive().optional(),
	maxPrice: z.coerce.number().positive().optional(),
	orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
	sortBy: z.enum([SortBy.CreatedAt, SortBy.Price, SortBy.Sale]).default(SortBy.CreatedAt),
})

export const GetProductsResSchema = z.object({
	data: z.array(ProductSchema),
	totalItems: z.number(),
	page: z.number(), // Số trang hiện tại
	limit: z.number(), // Số item trên 1 trang
	totalPages: z.number(), // Tổng số trang
})

export const GetProductParamsSchema = z
	.object({
		productId: z.coerce.number().int().positive(),
	})
	.strict()

export const GetProductDetailResSchema = ProductSchema.extend({
	skus: z.array(SKUSchema),
	categories: z.array(CategorySchema),
	brand: BrandSchema,
})

export const CreateProductBodySchema = ProductSchema.pick({
	name: true,
	basePrice: true,
	virtualPrice: true,
	brandId: true,
	images: true,
	description: true,
	variants: true,
})
	.extend({
		categories: z.array(z.coerce.number().int().positive()),
		skus: z.array(UpsertSKUBodySchema),
	})
	.strict()
	.superRefine(({ variants, skus }, ctx) => {
		// Kiểm tra xem số lượng SKU có hợp lệ hay không
		const skuValueArray = generateSKUs(variants)
		if (skus.length !== skuValueArray.length) {
			return ctx.addIssue({
				code: 'custom',
				path: ['skus'],
				message: `Số lượng SKU nên là ${skuValueArray.length}. Vui lòng kiểm tra lại.`,
			})
		}

		// Kiểm tra từng SKU có hợp lệ hay không
		let wrongSKUIndex = -1
		const isValidSKUs = skus.every((sku, index) => {
			const isValid = sku.value === skuValueArray[index].value
			if (!isValid) {
				wrongSKUIndex = index
			}
			return isValid
		})
		if (!isValidSKUs) {
			ctx.addIssue({
				code: 'custom',
				path: ['skus'],
				message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ. Vui lòng kiểm tra lại.`,
			})
		}
	})

export const UpdateProductBodySchema = CreateProductBodySchema

export type ProductType = z.infer<typeof ProductSchema>
export type VariantsType = z.infer<typeof VariantsSchema>
export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
