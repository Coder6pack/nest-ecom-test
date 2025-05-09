import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateUserBodyType, GetUsersQueryType, GetUsersResType } from './user.model'
import { UserType } from 'src/shared/models/shared-user.model'

@Injectable()
export class UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async getList({ page, limit }: GetUsersQueryType): Promise<GetUsersResType> {
		const skip = (page - 1) * limit
		const take = limit
		const [totalItems, data] = await Promise.all([
			this.prismaService.user.count(),
			this.prismaService.user.findMany({
				where: {
					deletedAt: null,
				},
				skip,
				take,
				include: {
					role: true,
				},
			}),
		])
		return {
			page,
			limit,
			data,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
		}
	}
	create({ createdById, data }: { createdById: number | null; data: CreateUserBodyType }): Promise<UserType> {
		return this.prismaService.user.create({
			data: {
				...data,
				createdById,
			},
		})
	}

	delete({ id, deletedById, isHard }: { id: number; deletedById: number; isHard?: boolean }): Promise<UserType> {
		return isHard
			? this.prismaService.user.delete({
					where: {
						id,
					},
				})
			: this.prismaService.user.update({
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
