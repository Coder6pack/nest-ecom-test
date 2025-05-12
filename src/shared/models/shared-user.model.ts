import { z } from 'zod'
import { UserStatus } from '../constants/auth.constant'
import { RoleSchema } from './shared-role.model'
import { PermissionSchema } from './shared-permission'

export const UserSchema = z.object({
	id: z.number(),
	name: z.string().min(1).max(255),
	email: z.string().email(),
	password: z.string().min(6).max(255),
	phoneNumber: z.string().min(9).max(15),
	totpSecret: z.string().nullable(),
	avatar: z.string().nullable(),
	address: z.string().nullable(),
	status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
	roleId: z.number().positive(),
	createdById: z.number().nullable(),
	updatedById: z.number().nullable(),
	deletedById: z.number().nullable(),
	deletedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const GetUserProfileResSchema = UserSchema.omit({
	password: true,
	totpSecret: true,
}).extend({
	role: RoleSchema.pick({
		id: true,
		name: true,
	}).extend({
		permissions: z.array(
			PermissionSchema.pick({
				id: true,
				name: true,
				method: true,
				module: true,
				description: true,
				path: true,
			}),
		),
	}),
})

export const UpdateUserProfileResSchema = UserSchema.omit({
	password: true,
	totpSecret: true,
})

export type UpdateUserProfileResType = z.infer<typeof UpdateUserProfileResSchema>
export type GetProfileType = z.infer<typeof GetUserProfileResSchema>
export type UserType = z.infer<typeof UserSchema>
