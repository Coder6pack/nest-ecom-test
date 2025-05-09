import { Body, Controller, Get, Ip, Post, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import {
	DisableTwoFactorBodyDTO,
	ForgotPasswordBodyDTO,
	GetAuthorizationResDTO,
	LoginBodyDTO,
	LoginResDTO,
	LogoutBodyDTO,
	RefreshTokenBodyDTO,
	RefreshTokenResDTO,
	RegisterBodyDTO,
	RegisterResDTO,
	SendOTPBodyDTO,
	TwoFactorSetupResDTO,
} from './auth.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { GoogleService } from './google.service'
import { Response } from 'express'
import envConfig from 'src/shared/config'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly googleService: GoogleService,
	) {}

	@Post('register')
	@IsPublic()
	@ZodSerializerDto(RegisterResDTO)
	register(@Body() body: RegisterBodyDTO) {
		return this.authService.register(body)
	}

	@Post('otp')
	@IsPublic()
	sendOTP(@Body() body: SendOTPBodyDTO) {
		return this.authService.sendOTP(body)
	}

	@Post('login')
	@IsPublic()
	@ZodSerializerDto(LoginResDTO)
	login(@Body() body: LoginBodyDTO, @Ip() ip: string, @UserAgent() userAgent: string) {
		return this.authService.login({
			...body,
			ip,
			userAgent,
		})
	}

	@Post('refresh-token')
	@IsPublic()
	@ZodSerializerDto(RefreshTokenResDTO)
	refreshToken(@Body() body: RefreshTokenBodyDTO, @Ip() ip: string, @UserAgent() userAgent: string) {
		return this.authService.refreshToken({
			refreshToken: body.refreshToken,
			ip,
			userAgent,
		})
	}

	@Post('logout')
	@ZodSerializerDto(MessageResDTO)
	logout(@Body() body: LogoutBodyDTO) {
		return this.authService.logout({ refreshToken: body.refreshToken })
	}

	@Get('google-link')
	@IsPublic()
	@ZodSerializerDto(GetAuthorizationResDTO)
	getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
		return this.googleService.getAuthorizationUrl({
			userAgent,
			ip,
		})
	}

	@Get('google/callback')
	@IsPublic()
	async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
		try {
			const data = await this.googleService.googleCallback({ code, state })
			return res.redirect(
				`${envConfig.GOOGLE_OAUTH_REDIRECT_CLIENT}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Lỗi không xác định vui lòng thử lại bằng cách khác'
			return res.redirect(`${envConfig.GOOGLE_OAUTH_REDIRECT_CLIENT}?errorMessage=${message}`)
		}
	}

	@Post('forgot-password')
	@IsPublic()
	@ZodSerializerDto(MessageResDTO)
	forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
		return this.authService.forgotPassword(body)
	}

	@Post('2fa/setup')
	@ZodSerializerDto(TwoFactorSetupResDTO)
	setupTwoFactorAuth(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
		return this.authService.setupFactorAuth(userId)
	}

	@Post('2fa/disable')
	@ZodSerializerDto(MessageResDTO)
	disableTwoFactorAuth(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: number) {
		return this.authService.disableTwoFactorAuth({
			...body,
			userId,
		})
	}
}
