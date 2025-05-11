import { PaginationQuerySchema } from 'src/shared/models/request.model'
import { PermissionSchema } from 'src/shared/models/shared-permission'
import { RoleSchema, RoleType } from 'src/shared/models/shared-role.model'
import { z } from 'zod'

export const RoleWithPermissionsSchema = RoleSchema.extend({
	permissions: z.array(PermissionSchema),
})

export const GetRolesResSchema = z.object({
	data: z.array(RoleSchema),
	totalItem: z.number(),
	page: z.number(),
	limit: z.number(),
	totalPage: z.number(),
})

export const CreateRoleBodySchema = RoleSchema.pick({
	name: true,
	isActive: true,
	description: true,
}).strict()

export const GetRoleDetailResSchema = RoleWithPermissionsSchema

export const CreateRoleResponseSchema = RoleSchema

export const GetRoleParamSchema = z
	.object({
		roleId: z.coerce.number(),
	})
	.strict()

export const GetRoleQuerySchema = PaginationQuerySchema

export const UpdateRoleBodySchema = RoleSchema.pick({
	name: true,
	isActive: true,
	description: true,
})
	.extend({
		permissionIds: z.array(z.number()),
	})
	.strict()

export const CreateRoleResSchema = RoleSchema

export type CreateRoleResType = RoleType
export type GetRoleQueryType = z.infer<typeof GetRoleQuerySchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type GetRoleParamType = z.infer<typeof GetRoleParamSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type GetRolesResType = z.infer<typeof GetRolesResSchema>
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>
