export const HTTPMethod = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	PATCH: 'PATCH',
	HEAD: 'HEAD',
	OPTIONS: 'OPTIONS',
} as const

export type HTTPMethodType = (typeof HTTPMethod)[keyof typeof HTTPMethod]
