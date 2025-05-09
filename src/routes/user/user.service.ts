import { ForbiddenException, Injectable } from '@nestjs/common'
import { UserRepository } from './user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { CreateUserBodyType, GetUsersQueryType, UpdateUserBodyType } from './user.model'
import {
	isForeignKeyConstraintPrismaError,
	isNotFoundPrismaError,
	isUniqueConstraintPrismaError,
} from 'src/shared/helpers'
import { CannotUpdateOrDeleteYourselfException, RoleNotFoundException, UserAlreadyExistsException } from './user.error'
import { RoleName } from 'src/shared/constants/role.constant'
import { NotFoundRecordException } from 'src/shared/error'

@Injectable()
export class UserService {
	constructor(
		private userRepository: UserRepository,
		private hashingService: HashingService,
		private sharedUserRepository: SharedUserRepository,
		private sharedRoleRepository: SharedRoleRepository,
	) {}

	getList(pagination: GetUsersQueryType) {
		return this.userRepository.getList(pagination)
	}

	async getDetail(useId: number) {
		const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
			id: useId,
		})
		if (!user) {
			throw NotFoundRecordException
		}
		return user
	}
	async createUser({
		createdById,
		createdByRoleName,
		data,
	}: {
		createdById: number
		createdByRoleName: string
		data: CreateUserBodyType
	}) {
		try {
			// Chỉ có admin agent mới có quyền tạo user với role là admin
			await this.verifyRole({
				roleNameAgent: createdByRoleName,
				roleIdTarget: data.roleId,
			})
			// Hash the password
			const hashedPassword = await this.hashingService.hash(data.password)

			const user = await this.userRepository.create({
				createdById,
				data: {
					...data,
					password: hashedPassword,
				},
			})
			return user
		} catch (error) {
			if (isForeignKeyConstraintPrismaError(error)) {
				throw RoleNotFoundException
			}

			if (isUniqueConstraintPrismaError(error)) {
				throw UserAlreadyExistsException
			}
			throw error
		}
	}
	/**
	 * Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
	 * Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
	 * Còn nếu không phải admin thì không được phép tác động đến admin
	 */
	private async verifyRole({ roleNameAgent, roleIdTarget }) {
		// Agent là admin thì cho phép
		if (roleNameAgent === RoleName.Admin) {
			return true
		} else {
			// Agent không phải admin thì roleIdTarget phải khác admin
			const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
			if (roleIdTarget === adminRoleId) {
				throw new ForbiddenException()
			}
			return true
		}
	}

	private async getRoleIdByUserId(userId: number) {
		const currentUser = await this.sharedUserRepository.findUnique({
			id: userId,
		})
		if (!currentUser) {
			throw NotFoundRecordException
		}
		return currentUser.roleId
	}

	private verifyYourself({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }) {
		if (userAgentId === userTargetId) {
			throw CannotUpdateOrDeleteYourselfException
		}
	}

	async updateUser({
		id,
		data,
		updatedById,
		updatedByRoleName,
	}: {
		id: number
		data: UpdateUserBodyType
		updatedById: number
		updatedByRoleName: string
	}) {
		try {
			// Không thể cập nhật chính mình
			this.verifyYourself({
				userAgentId: updatedById,
				userTargetId: id,
			})

			// Lấy roleId ban đầu của người được update để kiểm tra xem liệu người update có quyền update không
			// Không dùng data.roleId vì dữ liệu này có thể bị cố tình truyền sai
			const roleIdTarget = await this.getRoleIdByUserId(id)
			await this.verifyRole({
				roleNameAgent: updatedByRoleName,
				roleIdTarget,
			})

			const updatedUser = await this.sharedUserRepository.update(
				{ id },
				{
					...data,
					updatedById,
				},
			)
			return updatedUser
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw NotFoundRecordException
			}
			if (isUniqueConstraintPrismaError(error)) {
				throw UserAlreadyExistsException
			}
			if (isForeignKeyConstraintPrismaError(error)) {
				throw RoleNotFoundException
			}
			throw error
		}
	}
	async deleteUser({
		id,
		deletedById,
		deletedByRoleName,
	}: {
		id: number
		deletedById: number
		deletedByRoleName: string
	}) {
		try {
			// Không thể xóa chính mình
			this.verifyYourself({
				userAgentId: deletedById,
				userTargetId: id,
			})

			const roleIdTarget = await this.getRoleIdByUserId(id)
			await this.verifyRole({
				roleNameAgent: deletedByRoleName,
				roleIdTarget,
			})

			await this.userRepository.delete({
				id,
				deletedById,
			})
			return {
				message: 'Delete successfully',
			}
		} catch (error) {
			if (isNotFoundPrismaError(error)) {
				throw NotFoundRecordException
			}
			throw error
		}
	}
}
