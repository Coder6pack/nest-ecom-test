import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions, Server, Socket } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'
import { SharedWebsocketRepository } from 'src/shared/repositories/shared-websocket.repo'
import { TokenService } from 'src/shared/services/token.service'

export class WebSocketAdapter extends IoAdapter {
	private readonly sharedWebSocketRepository: SharedWebsocketRepository
	private readonly tokenService: TokenService
	constructor(app: INestApplicationContext) {
		super(app)
		this.sharedWebSocketRepository = app.get(SharedWebsocketRepository)
		this.tokenService = app.get(TokenService)
	}
	createIOServer(port: number, options?: ServerOptions) {
		const server: Server = super.createIOServer(3003, {
			...options,
			cors: {
				origin: '*',
				credential: true,
			},
		})
		server.use((socket, next) => {
			this.authMiddleware(socket, next)
				.then()
				.catch((err) => console.log(err))
		})
		server.of(/.*/).use((socket, next) => {
			this.authMiddleware(socket, next)
				.then()
				.catch((err) => console.log(err))
		})
		return server
	}
	async authMiddleware(socket: Socket, next: (err?: any) => void) {
		const { authorization } = socket.handshake.headers
		if (!authorization) {
			return next(new Error('No Authorization'))
		}
		const accessToken = authorization.split(' ')[1]
		if (!accessToken) {
			return next(new Error('No AccessToken'))
		}
		try {
			const { userId } = await this.tokenService.verifyAccessToken(accessToken)
			await socket.join(generateRoomUserId(userId))
			// await this.sharedWebSocketRepository.create({
			// 	id: socket.id,
			// 	userId,
			// })
			// socket.on('disconnect', () => {
			// 	console.log('disconnect:', socket.id)
			// })
			next()
		} catch (error) {
			next(error)
		}
		console.log('connection', socket.id)
	}
}
