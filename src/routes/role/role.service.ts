import { BadRequestException, Injectable } from '@nestjs/common'
import { RoleRepository } from './role.repo'
import { CreateRoleBodyType, GetRoleQueryType, UpdateRoleBodyType } from './role.model'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { RoleAlreadyExistsException } from './role.error'

@Injectable()
export class RoleService {
	constructor(private readonly roleRepository: RoleRepository) {}
	// Get list role
	getList(pagination: GetRoleQueryType) {
		return this.roleRepository.getList(pagination)
	}

	// Get detail
	async getDetail(id: number) {
		const role = await this.roleRepository.getDetail(id)
		if (!role) {
			throw NotFoundRecordException
		}
		return role
	}

	// Create new role
	async create({ data, userId }: { data: CreateRoleBodyType; userId: number }) {
		try {
			return await this.roleRepository.create({ data, userId })
		} catch (error) {
			if (isUniqueConstraintPrismaError(error)) {
				throw RoleAlreadyExistsException
			}
			throw error
		}
	}

	// Update role
	async update({ data, id, userId }: { data: UpdateRoleBodyType; id: number; userId: number }) {
		try {
			const role = await this.roleRepository.update({ data, userId, id })
			return role
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw NotFoundRecordException
			}
			if (isUniqueConstraintPrismaError(error)) {
				throw RoleAlreadyExistsException
			}
			throw error
		}
	}
	// Delete role
	async delete({ id, userId }: { id: number; userId: number }) {
		try {
			await this.roleRepository.delete({ id, userId, isHard: true })
			return {
				message: 'Deleted role successfully',
			}
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw NotFoundRecordException
			}
			throw error
		}
	}
}
