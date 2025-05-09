import { z } from 'zod'

export const PaginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
})

export type PaginationType = z.infer<typeof PaginationSchema>
