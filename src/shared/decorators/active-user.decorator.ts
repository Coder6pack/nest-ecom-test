import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AccessTokenPayload } from '../types/token.type'
import { REQUEST_USER_KEY } from '../constants/auth.constant'

export const ActiveUser = createParamDecorator(
	(fields: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest()
		const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY]
		return fields ? user?.[fields] : user
	},
)
