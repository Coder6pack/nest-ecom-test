import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
	CreateRoleBodyDTO,
	CreateRoleResDTO,
	GetRoleDetailResDTO,
	GetRoleParamDTO,
	GetRoleQueryDTO,
	GetRolesResDTO,
	UpdateRoleBodyDTO,
} from './role.dto'
import { RoleService } from './role.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	// Get list
	@Get()
	@ZodSerializerDto(GetRolesResDTO)
	getList(@Query() pagination: GetRoleQueryDTO) {
		return this.roleService.getList(pagination)
	}

	// Get detail
	@Get(':roleId')
	@ZodSerializerDto(GetRoleDetailResDTO)
	getDetail(@Param() param: GetRoleParamDTO) {
		return this.roleService.getDetail(param.roleId)
	}

	// Create role
	@Post('/create')
	@ZodSerializerDto(CreateRoleResDTO)
	create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
		return this.roleService.create({
			data: body,
			userId,
		})
	}

	// Update role
	@Put(':roleId')
	@ZodSerializerDto(GetRoleDetailResDTO)
	update(@Body() body: UpdateRoleBodyDTO, @ActiveUser('userId') userId: number, @Param() param: GetRoleParamDTO) {
		return this.roleService.update({
			data: body,
			id: param.roleId,
			userId,
		})
	}

	// Delete role
	@Delete(':roleId')
	@ZodSerializerDto(MessageResDTO)
	delete(@Param() param: GetRoleParamDTO, @ActiveUser('userId') userId: number) {
		return this.roleService.delete({ id: param.roleId, userId })
	}
}
