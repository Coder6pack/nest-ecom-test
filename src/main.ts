import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import envConfig from './shared/config'
import { WebSocketAdapter } from './websockets/websocket.adapter'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	app.enableCors()
	app.useWebSocketAdapter(new WebSocketAdapter(app))
	await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
