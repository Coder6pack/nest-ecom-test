import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from '../config'

@Injectable()
export class APIKeyGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const xApiKey = request.headers['x-api-key']
		if (!xApiKey) {
			throw new UnauthorizedException('Access token is required')
		}
		try {
			request[envConfig.SECRET_X_API_KEY] = xApiKey
			return true
		} catch {
			throw new UnauthorizedException('Invalid x api key')
		}
	}
}
