import { Body, Controller, Get, Put } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserProfileResDTO, UpdateUserProfileResDTO } from 'src/shared/dtos/share-user.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from './profile.dto'

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@ZodSerializerDto(GetUserProfileResDTO)
	getProfile(@ActiveUser('userId') userId: number) {
		return this.profileService.getProfile(userId)
	}

	@Put()
	@ZodSerializerDto(UpdateUserProfileResDTO)
	updateProfile(@ActiveUser('userId') userId: number, @Body() body: UpdateMeBodyDTO) {
		return this.profileService.updateProfile({
			userId,
			data: body,
		})
	}

	@Put('change-password')
	@ZodSerializerDto(UpdateUserProfileResDTO)
	changePassword(@ActiveUser('userId') userId: number, @Body() body: ChangePasswordBodyDTO) {
		return this.profileService.changePassword({
			userId,
			body,
		})
	}
}
