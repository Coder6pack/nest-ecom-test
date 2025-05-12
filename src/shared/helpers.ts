import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomInt } from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const isUniqueConstraintPrismaError = (error: any): error is PrismaClientKnownRequestError => {
	return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export const isNotFoundPrismaError = (error: any): error is PrismaClientKnownRequestError => {
	return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = (): string => {
	return String(randomInt(0, 100000)).padStart(6, '0')
}
export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}
export const generateRandomFileName = (fileName: string): string => {
	const ext = path.extname(fileName)
	return `${uuidv4()}${ext}`
}

export const generateCancelPaymentJobId = (paymentId: number) => {
	return `paymentId-${paymentId}`
}

export const generateRoomUserId = (userId: number) => {
	return `userId-${userId}`
}
