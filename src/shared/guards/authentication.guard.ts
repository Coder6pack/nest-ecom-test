import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY, AuthTypeDecoratorType } from '../decorators/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'
import { AuthItem, ConditionGuard } from '../constants/auth.constant'
import { PaymentAPIKeyGuard } from './payment-api-key.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
	private readonly authTypeGuardMap: Record<string, CanActivate>
	constructor(
		private readonly reflector: Reflector,
		private readonly accessTokenGuard: AccessTokenGuard,
		private readonly paymentApiKeyGuard: PaymentAPIKeyGuard,
	) {
		this.authTypeGuardMap = {
			[AuthItem.Bearer]: this.accessTokenGuard,
			[AuthItem.PaymentAPIKey]: this.paymentApiKeyGuard,
			[AuthItem.None]: { canActivate: () => true },
		}
	}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const authTypeValue = this.getAuthTypeValue(context)
		const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])
		return authTypeValue.options.condition === ConditionGuard.And
			? this.handleAndCondition(guards, context)
			: this.handleOrCondition(guards, context)
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

		// Duyệt qua hết các guard, nếu có 1 guard pass thì return true
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
		// Duyệt qua hết các guard, nếu mọi guard đều pass thì return true
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
