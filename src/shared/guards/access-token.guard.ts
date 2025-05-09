import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { TokenService } from '../services/token.service'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY } from '../constants/auth.constant'
import { AccessTokenPayload } from '../types/token.type'
import { PrismaService } from '../services/prisma.service'
import { HTTPMethod } from '../constants/http.constant'

@Injectable()
export class AccessTokenGuard implements CanActivate {
	constructor(
		private readonly tokenService: TokenService,
		private readonly prismaService: PrismaService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		// Extract and validate the access token from the request header
		const decodeAccessToken = await this.extractAndValidateToken(request)
		// Validate the user permissions based on the decoded access token
		await this.validateUserPermissions(decodeAccessToken, request)
		return true
	}

	private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
		const accessToken = this.extractAccessTokenFromHeader(request)
		try {
			const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
			request[REQUEST_USER_KEY] = decodedAccessToken
			return decodedAccessToken
		} catch {
			throw new UnauthorizedException('Invalid access token')
		}
	}
	private extractAccessTokenFromHeader(request: any): string {
		const accessToken = request.headers['authorization']?.split(' ')[1]
		if (!accessToken) {
			throw new UnauthorizedException('Access token is required')
		}
		return accessToken
	}

	private async validateUserPermissions(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
		const roleId = decodedAccessToken.roleId
		const path = request.route.path
		const method = request.method as keyof typeof HTTPMethod
		const role = await this.prismaService.role
			.findUniqueOrThrow({
				where: {
					id: roleId,
					deletedAt: null,
				},
				include: {
					permissions: {
						where: {
							deletedAt: null,
							path,
							method,
						},
					},
				},
			})
			.catch((error) => {
				throw new ForbiddenException()
			})
		const canAccess = role.permissions.length > 0
		if (!canAccess) {
			throw new ForbiddenException()
		}
		request[REQUEST_ROLE_PERMISSIONS] = role
	}
}
