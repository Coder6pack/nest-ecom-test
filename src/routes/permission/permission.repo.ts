import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
	CreatePermissionBodyType,
	GetPermissionQueryType,
	GetPermissionsResType,
	UpdatePermissionBodyType,
	UpdatePermissionResType,
} from './permission.model'
import { PermissionType } from 'src/shared/models/shared-permission'

@Injectable()
export class PermissionRepository {
	constructor(private readonly prismaService: PrismaService) {}

	// Get all permissions
	async getList({ page, limit }: GetPermissionQueryType): Promise<GetPermissionsResType> {
		const skip = (page - 1) * limit
		const [totalItem, data] = await Promise.all([
			this.prismaService.permission.count({
				where: {
					deletedAt: null,
				},
			}),
			this.prismaService.permission.findMany({
				where: {
					deletedAt: null,
				},
				skip,
				take: limit,
			}),
		])
		return {
			data,
			totalItem,
			page,
			limit,
			totalPage: Math.ceil(totalItem / limit),
		}
	}

	getDetail(id: number): Promise<PermissionType | null> {
		return this.prismaService.permission.findUnique({
			where: {
				id,
				deletedAt: null,
			},
		})
	}

	create({ data, userId }: { data: CreatePermissionBodyType; userId: number }): Promise<PermissionType> {
		return this.prismaService.permission.create({
			data: {
				...data,
				createdById: userId,
				updatedById: userId,
			},
		})
	}

	update({
		userId,
		id,
		data,
	}: {
		userId: number
		id: number
		data: UpdatePermissionBodyType
	}): Promise<UpdatePermissionResType> {
		return this.prismaService.permission.update({
			where: {
				id,
				deletedAt: null,
			},
			data: {
				...data,
				updatedById: userId,
			},
		})
	}

	delete({ id, isHard, userId }: { id: number; isHard?: boolean; userId: number }): Promise<PermissionType> {
		return isHard
			? this.prismaService.permission.delete({
					where: {
						id,
					},
				})
			: this.prismaService.permission.update({
					where: {
						id,
						deletedAt: null,
					},
					data: {
						deletedAt: new Date(),
						updatedById: userId,
					},
				})
	}
}
