import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from '../config'

@Injectable()
export class TwoFactorService {
	private createOTP(email: string, secret?: string) {
		return new OTPAuth.TOTP({
			issuer: envConfig.APP_NAME,
			label: email,
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: secret || new OTPAuth.Secret(),
		})
	}

	async generateOTP(email: string) {
		const tOtp = this.createOTP(email)
		return {
			secret: tOtp.secret.base32,
			uri: tOtp.toString(),
		}
	}

	verifyTOTP({ email, secret, token }: { email: string; secret: string; token: string }): boolean {
		const tOtp = this.createOTP(email, secret)
		const delta = tOtp.validate({ token, window: 1 })
		return delta !== null
	}
}
