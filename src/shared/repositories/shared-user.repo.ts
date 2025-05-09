import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-user.model'
import { RoleType } from '../models/shared-role.model'
import { PermissionType } from '../models/shared-permission'

type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } }

export type WhereUniqueUserType = { id: number } | { email: string }

@Injectable()
export class SharedUserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findUnique(where: WhereUniqueUserType | { id: number }): Promise<UserType | null> {
		return this.prismaService.user.findFirst({
			where: {
				...where,
				deletedAt: null,
			},
		})
	}
	findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
		return this.prismaService.user.findFirst({
			where: {
				...where,
				deletedAt: null,
			},
			include: {
				role: {
					include: {
						permissions: {
							where: {
								deletedAt: null,
							},
						},
					},
				},
			},
		})
	}

	update(where: { id: number }, data: Partial<UserType>): Promise<UserType | null> {
		return this.prismaService.user.update({
			where: {
				...where,
				deletedAt: null,
			},
			data,
		})
	}
}
