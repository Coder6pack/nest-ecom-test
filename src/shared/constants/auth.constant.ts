export const REQUEST_USER_KEY = 'user'
export const REQUEST_ROLE_PERMISSIONS = 'role_permissions'

export const AuthItem = {
	Bearer: 'Bearer',
	None: 'None',
	APIKey: 'APIKey',
} as const

export type AuthType = (typeof AuthItem)[keyof typeof AuthItem]

export const ConditionGuard = {
	And: 'and',
	Or: 'or',
} as const

export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]

export const UserStatus = {
	ACTIVE: 'ACTIVE',
	INACTIVE: 'INACTIVE',
	BLOCKED: 'BLOCKED',
} as const

export const TypeOfVerificationCode = {
	REGISTER: 'REGISTER',
	FORGOT_PASSWORD: 'FORGOT_PASSWORD',
	LOGIN: 'LOGIN',
	DISABLE_2FA: 'DISABLE_2FA',
} as const

export type TypeOfVerificationCodeType = (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode]
