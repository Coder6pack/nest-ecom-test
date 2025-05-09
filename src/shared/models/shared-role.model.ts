import { z } from 'zod'
import { PermissionSchema } from './shared-permission'

export const RoleSchema = z.object({
	id: z.number(),
	name: z.string().max(500),
	description: z.string(),
	isActive: z.boolean(),
	createdById: z.number().nullable(),
	updatedById: z.number().nullable(),
	deletedById: z.number().nullable(),
	deletedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const RolePermissionsSchema = RoleSchema.extend({
	permissions: z.array(PermissionSchema),
})

export type RolePermissionsType = z.infer<typeof RolePermissionsSchema>
export type RoleType = z.infer<typeof RoleSchema>
