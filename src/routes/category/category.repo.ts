import { Injectable } from '@nestjs/common'
import {
	CreateCategoryBodyType,
	GetAllCategoriesResType,
	UpdateCategoryBodyType,
	CategoryType,
	GetCategoryDetailResType,
} from 'src/routes/category/category.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CategoryRepo {
	constructor(private prismaService: PrismaService) {}

	async findAll(parentCategoryId?: number | null): Promise<GetAllCategoriesResType> {
		const categories = await this.prismaService.category.findMany({
			where: {
				deletedAt: null,
				parentCategoryId: parentCategoryId ?? null,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return {
			data: categories,
			totalItems: categories.length,
		}
	}

	findById(id: number): Promise<GetCategoryDetailResType | null> {
		return this.prismaService.category.findUnique({
			where: {
				id,
				deletedAt: null,
			},
		})
	}

	create({
		createdById,
		data,
	}: {
		createdById: number | null
		data: CreateCategoryBodyType
	}): Promise<GetCategoryDetailResType> {
		return this.prismaService.category.create({
			data: {
				...data,
				createdById,
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
		data: UpdateCategoryBodyType
	}): Promise<GetCategoryDetailResType> {
		return this.prismaService.category.update({
			where: {
				id,
				deletedAt: null,
			},
			data: {
				...data,
				updatedById,
			},
		})
	}

	delete({ id, deletedById, isHard }: { id: number; deletedById: number; isHard?: boolean }): Promise<CategoryType> {
		return isHard
			? this.prismaService.category.delete({
					where: {
						id,
					},
				})
			: this.prismaService.category.update({
					where: {
						id,
						deletedAt: null,
					},
					data: {
						deletedAt: new Date(),
						deletedById,
					},
				})
	}
}
