import { createZodDto } from 'nestjs-zod'
import {
	CreateUserBodySchema,
	GetUserParamsSchema,
	GetUsersQuerySchema,
	GetUsersResSchema,
	UpdateUserBodySchema,
} from 'src/routes/user/user.model'
import { UpdateUserProfileResDTO } from 'src/shared/dtos/share-user.dto'

export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}

export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}

export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class CreateUserResDTO extends UpdateUserProfileResDTO {}
