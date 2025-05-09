import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const RegisterBodySchema = UserSchema.pick({
	name: true,
	email: true,
	password: true,
	phoneNumber: true,
})
	.extend({
		confirmPassword: z.string().min(6).max(255),
		code: z.string().length(6),
	})
	.strict()
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'Password and Confirm Password do not match',
				path: ['confirmPassword'],
			})
		}
	})

export const RegisterResSchema = UserSchema.omit({
	password: true,
	totpSecret: true,
})

export const VerificationCodeSchema = z.object({
	id: z.number().positive(),
	email: z.string().email(),
	code: z.string().length(50),
	type: z.enum([
		TypeOfVerificationCode.REGISTER,
		TypeOfVerificationCode.FORGOT_PASSWORD,
		TypeOfVerificationCode.LOGIN,
		TypeOfVerificationCode.DISABLE_2FA,
	]),
	expiresAt: z.date(),
	createdAt: z.date(),
})

export const SendOTPBodySchema = VerificationCodeSchema.pick({
	email: true,
	type: true,
}).strict()

export const LoginBodySchema = UserSchema.pick({
	email: true,
	password: true,
})
	.extend({
		totpCode: z.string().length(6).optional(), // 2FA code
		code: z.string().length(6).optional(), // Email OTP code
	})
	.strict()

export const LoginResSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
})
export const RefreshTokenBodySchema = z
	.object({
		refreshToken: z.string(),
	})
	.strict()

export const RefreshTokenResSchema = LoginResSchema

export const DeviceSchema = z.object({
	id: z.number(),
	userId: z.number(),
	userAgent: z.string(),
	ip: z.string(),
	lastActive: z.date(),
	createdAt: z.date(),
	isActive: z.boolean(),
})

export const RefreshTokenSchema = z.object({
	token: z.string(),
	userId: z.number(),
	deviceId: z.number(),
	expiresAt: z.date(),
	createdAt: z.date(),
})

export const ForgotPasswordBodySchema = z
	.object({
		email: z.string().email(),
		code: z.string().length(6),
		newPassword: z.string().min(6).max(255),
		confirmPassword: z.string().min(6).max(255),
	})
	.strict()
	.superRefine(({ confirmPassword, newPassword }, ctx) => {
		if (confirmPassword !== newPassword) {
			ctx.addIssue({
				message: 'Password and Confirm Password do not match',
				code: 'custom',
				path: ['confirmPassword'],
			})
		}
	})

export const DisableTwoFactorBodySchema = z
	.object({
		totpCode: z.string().length(6).optional(), // 2FA code
		code: z.string().length(6).optional(), // Email OTP code
	})
	.strict()
	.superRefine(({ totpCode, code }, ctx) => {
		const message = 'Error.RequireTotpCodeOrEmailCodeNotRequireTwo'
		// Nếu cả 2 đều có hoặc không có giá trị thì sẽ nhảy vào if
		if ((totpCode !== undefined) === (code !== undefined)) {
			ctx.addIssue({
				code: 'custom',
				message,
				path: ['totpCode'],
			})
			ctx.addIssue({
				code: 'custom',
				message,
				path: ['code'],
			})
		}
	})

export const TwoFactorSetupResSchema = z.object({
	secret: z.string(),
	uri: z.string(),
})
export type TowFactorSetupType = z.infer<typeof TwoFactorSetupResSchema>
export type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
export const LogoutBodySchema = RefreshTokenBodySchema
export const GetAuthorizationBodySchema = DeviceSchema.pick({
	userAgent: true,
	ip: true,
})
export const GetAuthorizationResSchema = z.object({
	url: z.string().url(),
})

export type GetAuthorizationResType = z.infer<typeof GetAuthorizationResSchema>
export type GetAuthorizationBodyType = z.infer<typeof GetAuthorizationBodySchema>
export type LogoutBodyType = RefreshTokenBodyType
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type DeviceType = z.infer<typeof DeviceSchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenResType = LoginResType
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type SendOPTBodyType = z.infer<typeof SendOTPBodySchema>
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>
export type VerifiCationCodeType = z.infer<typeof VerificationCodeSchema>
