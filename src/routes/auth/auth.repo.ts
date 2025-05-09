import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { DeviceType, RefreshTokenType, VerifiCationCodeType } from './auth.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { RoleType } from 'src/shared/models/shared-role.model'
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class AuthRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createUser(
		user: Pick<UserType, 'name' | 'email' | 'phoneNumber' | 'password' | 'roleId'>,
	): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
		return await this.prismaService.user.create({
			data: user,
			omit: {
				password: true,
				totpSecret: true,
			},
		})
	}
	async createUserIncludeRole(
		user: Pick<UserType, 'name' | 'email' | 'phoneNumber' | 'password' | 'roleId' | 'avatar'>,
	): Promise<UserType & { role: RoleType }> {
		return await this.prismaService.user.create({
			data: user,
			include: {
				role: true,
			},
		})
	}

	async createVerificationCode(payload: Omit<VerifiCationCodeType, 'id' | 'createdAt'>): Promise<VerifiCationCodeType> {
		const { email, code, type, expiresAt } = payload
		return this.prismaService.verificationCode.upsert({
			where: {
				email_code_type: {
					email,
					code,
					type,
				},
			},
			create: payload,
			update: {
				code,
				expiresAt,
				type,
			},
		})
	}

	async findUniqueVerificationCode(
		where:
			| { id: number }
			| {
					email_code_type: {
						email: string
						code: string
						type: TypeOfVerificationCodeType
					}
			  },
	): Promise<VerifiCationCodeType | null> {
		return this.prismaService.verificationCode.findUnique({
			where,
		})
	}
	async findUniqueIncludeRole(where: WhereUniqueUserType): Promise<(UserType & { role: RoleType }) | null> {
		return this.prismaService.user.findFirst({
			where: {
				...where,
				deletedAt: null,
			},
			include: {
				role: true,
			},
		})
	}

	async createRefreshToken(data: Omit<RefreshTokenType, 'createdAt'>): Promise<RefreshTokenType> {
		return this.prismaService.refreshToken.create({
			data,
		})
	}

	async createDevice(
		data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
	): Promise<DeviceType> {
		return this.prismaService.device.create({
			data,
		})
	}

	findUniqueRefreshTokenINcludeUserRole(where: {
		token: string
	}): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
		return this.prismaService.refreshToken.findUnique({
			where,
			include: {
				user: {
					include: {
						role: true,
					},
				},
			},
		})
	}

	updateDevice(deviceId: number, data: Partial<DeviceType>): Promise<DeviceType> {
		return this.prismaService.device.update({
			where: {
				id: deviceId,
			},
			data,
		})
	}

	deleteRefreshToken(where: { token: string }) {
		return this.prismaService.refreshToken.delete({
			where,
		})
	}
	deleteVerificationCode(
		where:
			| { id: number }
			| {
					email_code_type: {
						email: string
						code: string
						type: TypeOfVerificationCodeType
					}
			  },
	): Promise<VerifiCationCodeType> {
		return this.prismaService.verificationCode.delete({
			where,
		})
	}
}
