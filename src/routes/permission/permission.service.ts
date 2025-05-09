import { Injectable } from '@nestjs/common'
import { PermissionRepository } from './permission.repo'
import { CreatePermissionBodyType, GetPermissionQueryType, UpdatePermissionBodyType } from './permission.model'
import { NotFoundPermissionException, PermissionAlreadyExistsException } from './permission.error'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class PermissionService {
	constructor(private readonly permissionRepository: PermissionRepository) {}

	// Get all permissions
	getList(pagination: GetPermissionQueryType) {
		return this.permissionRepository.getList(pagination)
	}

	// Get detail
	async getDetail(id: number) {
		const permission = await this.permissionRepository.getDetail(id)
		if (!permission) {
			throw NotFoundRecordException
		}
		return permission
	}

	// Create permission
	async create({ data, userId }: { data: CreatePermissionBodyType; userId: number }) {
		try {
			return await this.permissionRepository.create({ data, userId })
		} catch (error) {
			if (isUniqueConstraintPrismaError(error)) {
				throw PermissionAlreadyExistsException
			}
			throw error
		}
	}

	// Update permission
	async update({ userId, id, data }: { userId: number; id: number; data: UpdatePermissionBodyType }) {
		try {
			const permission = await this.permissionRepository.update({ userId, id, data })
			return permission
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw NotFoundRecordException
			}
			if (isUniqueConstraintPrismaError(error)) {
				throw PermissionAlreadyExistsException
			}
			throw error
		}
	}

	// Delete permission
	async delete({ id, userId }: { id: number; userId: number }) {
		try {
			await this.permissionRepository.delete({ id, userId, isHard: true })
			return {
				message: 'Delete permission successfully',
			}
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw NotFoundRecordException
			}
			throw error
		}
	}
}
