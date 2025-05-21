import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const UpdateMeBodySchema = z
	.object({
		// name: true,
		// phoneNumber: true,
		// avatar: true,
		name: z.string().max(255),
		phoneNumber: z.string().optional(),
		avatar: z.string().url().optional(),
	})
	.strict()

export const ChangePasswordBodySchema = UserSchema.pick({
	password: true,
})
	.extend({
		newPassword: z.string().min(6).max(255),
		confirmPassword: z.string().min(6).max(255),
	})
	.strict()
	.superRefine(({ newPassword, confirmPassword }, ctx) => {
		if (newPassword !== confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'Error.ConfirmPasswordNotMatch',
				path: ['confirmPassword'],
			})
		}
	})

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>
