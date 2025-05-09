import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
	CreateUserBodyDTO,
	CreateUserResDTO,
	GetUserParamsDTO,
	GetUsersQueryDTO,
	GetUsersResDTO,
	UpdateUserBodyDTO,
} from './user.dto'
import { GetUserProfileResDTO, UpdateUserProfileResDTO } from 'src/shared/dtos/share-user.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permission.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@ZodSerializerDto(GetUsersResDTO)
	getList(@Query() pagination: GetUsersQueryDTO) {
		return this.userService.getList(pagination)
	}

	@Get(':userId')
	@ZodSerializerDto(GetUserProfileResDTO)
	getDetail(@Param() params: GetUserParamsDTO) {
		return this.userService.getDetail(params.userId)
	}

	@Post()
	@ZodSerializerDto(CreateUserResDTO)
	createUser(
		@Body() body: CreateUserBodyDTO,
		@ActiveUser('userId') userId: number,
		@ActiveRolePermissions('name') roleName: string,
	) {
		return this.userService.createUser({
			createdById: userId,
			createdByRoleName: roleName,
			data: body,
		})
	}

	@Put(':userId')
	@ZodSerializerDto(UpdateUserProfileResDTO)
	updateUser(
		@Body() body: UpdateUserBodyDTO,
		@ActiveUser('userId') userId: number,
		@ActiveRolePermissions('name') roleName: string,
		@Param() params: GetUserParamsDTO,
	) {
		return this.userService.updateUser({
			id: params.userId,
			updatedById: userId,
			updatedByRoleName: roleName,
			data: body,
		})
	}

	@Delete(':userId')
	@ZodSerializerDto(MessageResDTO)
	deleteUser(
		@Param() params: GetUserParamsDTO,
		@ActiveUser('userId') userId: number,
		@ActiveRolePermissions('name') roleName: string,
	) {
		return this.userService.deleteUser({
			id: params.userId,
			deletedById: userId,
			deletedByRoleName: roleName,
		})
	}
}
