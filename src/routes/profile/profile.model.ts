import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const UpdateMeBodySchema = UserSchema.pick({
	name: true,
	phoneNumber: true,
	avatar: true,
}).strict()

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
				path: ['confirmNewPassword'],
			})
		}
	})

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>
