import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
	CreateRoleBodyType,
	CreateRoleResType,
	GetRoleQueryType,
	GetRolesResType,
	RoleWithPermissionsType,
	UpdateRoleBodyType,
} from './role.model'
import { RoleType } from 'src/shared/models/shared-role.model'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constant'
import { ProhibitedActionOnBaseRoleException } from './role.error'

@Injectable()
export class RoleRepository {
	constructor(private readonly prismaService: PrismaService) {}

	// Get list role
	async getList({ page, limit }: GetRoleQueryType): Promise<GetRolesResType> {
		const skip = (page - 1) * limit
		const take = limit
		const [totalItem, data] = await Promise.all([
			this.prismaService.role.count({
				where: {
					deletedAt: null,
				},
			}),
			this.prismaService.role.findMany({
				where: {
					deletedAt: null,
				},
				skip,
				take,
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
	// Get role detail
	async getDetail(id: number): Promise<RoleWithPermissionsType | null> {
		return await this.prismaService.role.findUnique({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				permissions: {
					where: {
						deletedAt: null,
					},
				},
			},
		})
	}
	// Create role
	async create({ data, userId }: { data: CreateRoleBodyType; userId: number }): Promise<CreateRoleResType> {
		return await this.prismaService.role.create({
			data: {
				...data,
				createdById: userId,
				updatedById: userId,
			},
		})
	}
	// Update role
	async update({
		data,
		id,
		userId,
	}: {
		data: UpdateRoleBodyType
		id: number
		userId: number
	}): Promise<RoleWithPermissionsType> {
		if (data.permissionIds.length > 0) {
			const role = await this.prismaService.role.findUnique({
				where: {
					id,
					deletedAt: null,
				},
			})
			if (!role) {
				throw NotFoundRecordException
			}
			if (role.name === RoleName.Admin) {
				throw ProhibitedActionOnBaseRoleException
			}
			const permissions = await this.prismaService.permission.findMany({
				where: {
					id: { in: data.permissionIds },
				},
			})
			if (permissions.length > 0) {
				const deletedIds = permissions.map((permission) => permission.id).join(', ')
				throw new Error(`Permission with id has been deleted: ${deletedIds}`)
			}
		}
		return await this.prismaService.role.update({
			where: {
				id,
				deletedAt: null,
			},
			data: {
				...data,
				permissions: {
					set: data.permissionIds.map((id) => ({ id })),
				},
				updatedById: userId,
			},
			include: {
				permissions: {
					where: {
						deletedAt: null,
					},
				},
			},
		})
	}
	// Delete role
	async delete({ id, userId, isHard }: { id: number; userId: number; isHard?: boolean }): Promise<RoleType> {
		const role = await this.prismaService.role.findUnique({
			where: {
				id,
				deletedAt: null,
			},
		})
		if (!role) {
			throw NotFoundRecordException
		}
		const baseRoles: string[] = [RoleName.Admin, RoleName.Client, RoleName.Seller]
		if (baseRoles.includes(role.name)) {
			throw ProhibitedActionOnBaseRoleException
		}
		return isHard
			? this.prismaService.role.delete({
					where: {
						id,
					},
				})
			: this.prismaService.role.update({
					where: {
						id,
						deletedAt: null,
					},
					data: {
						deletedAt: new Date(),
						deletedById: userId,
					},
				})
	}
}
