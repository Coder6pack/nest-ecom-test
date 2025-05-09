import { SetMetadata } from '@nestjs/common'
import { AuthItem, AuthType, ConditionGuard, ConditionGuardType } from '../constants/auth.constant'
export const AUTH_TYPE_KEY = 'authType'

export type AuthTypeDecoratorType = {
	authTypes: AuthType[]
	options: { condition: ConditionGuardType }
}
export const Auth = (authTypes: AuthType[], options?: { condition: ConditionGuardType }) => {
	return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.And } })
}
export const IsPublic = () => Auth([AuthItem.None])
