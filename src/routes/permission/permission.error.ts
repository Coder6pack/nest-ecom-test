import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const NotFoundPermissionException = new NotFoundException('Not found permission is database')

export const PermissionAlreadyExistsException = new UnprocessableEntityException([
	{
		message: 'Error.PermissionAlreadyExists',
		path: 'path',
	},
	{
		message: 'Error.PermissionAlreadyExists',
		path: 'method',
	},
])
