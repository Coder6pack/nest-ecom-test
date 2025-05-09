import { google } from 'googleapis'
import envConfig from 'src/shared/config'
import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { GetAuthorizationBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { AuthService } from './auth.service'
import { v4 as uuidV4 } from 'uuid'
import { GoogleUserInfoError } from './auth.error'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
@Injectable()
export class GoogleService {
	private oauth2Client: OAuth2Client
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly hashingService: HashingService,
		private readonly authService: AuthService,
		private readonly sharedRoleRepository: SharedRoleRepository,
	) {
		this.oauth2Client = new google.auth.OAuth2(
			envConfig.GOOGLE_OAUTH_CLIENT_ID,
			envConfig.GOOGLE_OAUTH_CLIENT_SECRET,
			envConfig.GOOGLE_OAUTH_REDIRECT_URI,
		)
	}
	getAuthorizationUrl({ userAgent, ip }) {
		const scope = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']

		// Chuyển Object sang string chuỗi base 64 an toàn khi có dấu {}
		const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64')
		// Tạo URL để gửi về client
		const url = this.oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope,
			include_granted_scopes: true,
			state: stateString,
		})
		return { url }
	}

	async googleCallback({ code, state }: { code: string; state: string }) {
		try {
			let ip = 'Unknown'
			let userAgent = 'Unknown'

			// Lấy state từ url
			try {
				if (state) {
					const stateString = JSON.parse(Buffer.from(state, 'base64').toString()) as GetAuthorizationBodyType
					ip = stateString.ip
					userAgent = stateString.userAgent
				}
			} catch (error) {
				console.log('Error parsing state:', error)
			}

			// Dùng code để lấy token
			const { tokens } = await this.oauth2Client.getToken(code)
			this.oauth2Client.setCredentials(tokens)

			// Lấy thông tin google user
			const oauth2 = google.oauth2({
				auth: this.oauth2Client,
				version: 'v2',
			})

			// Lấy thông tin người dùng từ Google
			const { data } = await oauth2.userinfo.get()
			if (!data.email) {
				throw GoogleUserInfoError
			}
			let user = await this.authRepository.findUniqueIncludeRole({
				email: data.email,
			})

			// Nếu không có user thì đăng ký mới
			if (!user) {
				const clientRoleId = await this.sharedRoleRepository.getRoleId()
				const hashPassword = await this.hashingService.hash(uuidV4())
				user = await this.authRepository.createUserIncludeRole({
					email: data.email,
					name: data.name ?? '',
					avatar: data.picture ?? '',
					phoneNumber: '',
					roleId: clientRoleId,
					password: hashPassword,
				})
			}
			// Tạo device cho user
			const device = await this.authRepository.createDevice({
				userId: user.id,
				userAgent,
				ip,
			})

			// Tạo tokens cho user
			const authTokens = await this.authService.generateTokens({
				deviceId: device.id,
				userId: user.id,
				roleId: user.roleId,
				roleName: user.role.name,
			})
			return authTokens
		} catch (error) {
			console.log('Error in googleCallback:, error)')
			throw error
		}
	}
}
