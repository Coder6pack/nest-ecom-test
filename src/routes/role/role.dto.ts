import { createZodDto } from 'nestjs-zod'
import {
	CreateRoleBodySchema,
	CreateRoleResSchema,
	GetRoleDetailResSchema,
	GetRoleParamSchema,
	GetRoleQuerySchema,
	GetRolesResSchema,
	UpdateRoleBodySchema,
} from './role.model'

export class GetRolesResDTO extends createZodDto(GetRolesResSchema) {}

export class GetRoleDetailResDTO extends createZodDto(GetRoleDetailResSchema) {}

export class GetRoleParamDTO extends createZodDto(GetRoleParamSchema) {}

export class GetRoleQueryDTO extends createZodDto(GetRoleQuerySchema) {}

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}

export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}

export class CreateRoleResDTO extends createZodDto(CreateRoleResSchema) {}
