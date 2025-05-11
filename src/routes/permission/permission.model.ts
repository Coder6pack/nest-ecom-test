import { PaginationQuerySchema } from 'src/shared/models/request.model'
import { PermissionSchema, PermissionType } from 'src/shared/models/shared-permission'
import { z } from 'zod'

export const CreatePermissionBodySchema = PermissionSchema.pick({
	name: true,
	path: true,
	method: true,
	module: true,
}).strict()

export const GetPermissionDetailResSchema = PermissionSchema

export const GetPermissionQuerySchema = PaginationQuerySchema

export const GetPermissionsResSchema = GetPermissionQuerySchema.extend({
	data: z.array(PermissionSchema),
	totalItem: z.number(),
	page: z.number(),
	limit: z.number(),
	totalPage: z.number(),
})

export const UpdatePermissionBodySchema = CreatePermissionBodySchema

export const UpdatePermissionResSchema = PermissionSchema

export const GetPermissionParamsSchema = z
	.object({
		permissionId: z.coerce.number(),
	})
	.strict()

export type GetPermissionParamType = z.infer<typeof GetPermissionParamsSchema>
export type UpdatePermissionResType = PermissionType
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>
export type GetPermissionQueryType = z.infer<typeof GetPermissionQuerySchema>
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
