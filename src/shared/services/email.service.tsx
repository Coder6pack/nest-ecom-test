import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import OTPEmail from 'emails/OTPEmail'
import * as React from 'react'

@Injectable()
export class EmailService {
	private resend: Resend
	constructor() {
		this.resend = new Resend(envConfig.RESEND_OTP_API_KEY_SECRET)
	}

	async sendOTP(payload: { email: string; code: string }) {
		const subject = 'OTP code'
		return this.resend.emails.send({
			from: 'NestJS <no-reply@nhondev.io.vn>',
			to: [payload.email],
			subject,
			react: <OTPEmail otpCode={payload.code} title={subject} />,
		})
	}
}
