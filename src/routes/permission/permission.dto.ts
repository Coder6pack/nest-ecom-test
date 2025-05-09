import { createZodDto } from 'nestjs-zod'
import {
	CreatePermissionBodySchema,
	GetPermissionQuerySchema,
	GetPermissionDetailResSchema,
	GetPermissionsResSchema,
	UpdatePermissionBodySchema,
	UpdatePermissionResSchema,
	GetPermissionParamsSchema,
} from './permission.model'

export class GetPermissionQueryDTO extends createZodDto(GetPermissionQuerySchema) {}

export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}

export class GetPermissionsResDTO extends createZodDto(GetPermissionsResSchema) {}

export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

export class UpdatePermissionResDTO extends createZodDto(UpdatePermissionResSchema) {}

export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}
