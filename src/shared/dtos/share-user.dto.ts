import { createZodDto } from 'nestjs-zod'
import { GetUserProfileResSchema, UpdateUserProfileResSchema } from '../models/shared-user.model'

export class GetUserProfileResDTO extends createZodDto(GetUserProfileResSchema) {}

export class UpdateUserProfileResDTO extends createZodDto(UpdateUserProfileResSchema) {}
