import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
	@WebSocketServer()
	server: Server
	@SubscribeMessage('sent-message')
	handleEvent(@MessageBody() data: string): string {
		this.server.emit('receive-message', {
			data: `hello a ${data} handsome`,
		})
		return data
	}
}
