import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY, AuthTypeDecoratorType } from '../decorators/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'
import { APIKeyGuard } from './api-key.guard'
import { AuthItem, ConditionGuard } from '../constants/auth.constant'

@Injectable()
export class AuthenticationGuard implements CanActivate {
	private readonly authTypeGuardMap: Record<string, CanActivate>
	constructor(
		private readonly reflector: Reflector,
		private readonly accessTokenGuard: AccessTokenGuard,
		private readonly apiKeyGuard: APIKeyGuard,
	) {
		this.authTypeGuardMap = {
			[AuthItem.Bearer]: this.accessTokenGuard,
			[AuthItem.APIKey]: this.apiKeyGuard,
			[AuthItem.None]: { canActivate: () => true },
		}
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const authTypeValue = this.getAuthTypeValue(context)
		const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])

		return authTypeValue.options.condition === ConditionGuard.And
			? await this.handleAndCondition(guards, context)
			: await this.handleOrCondition(guards, context)
	}
	private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorType {
		return (
			this.reflector.getAllAndOverride<AuthTypeDecoratorType | undefined>(AUTH_TYPE_KEY, [
				context.getHandler(),
				context.getClass(),
			]) ?? { authTypes: [AuthItem.Bearer], options: { condition: ConditionGuard.And } }
		)
	}

	private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
		let lastError: any = null
		for (const guard of guards) {
			try {
				if (await guard.canActivate(context)) {
					return true
				}
			} catch (error) {
				lastError = error
			}
		}
		if (lastError instanceof HttpException) {
			throw lastError
		}
		throw new UnauthorizedException()
	}

	private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
		for (const guard of guards) {
			try {
				if (!(await guard.canActivate(context))) {
					throw new UnauthorizedException()
				}
			} catch (error) {
				if (error instanceof HttpException) {
					throw error
				}
				throw new UnauthorizedException()
			}
		}
		return true
	}
}
