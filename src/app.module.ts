import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from './shared/fillters/http-exception.filter'
import { AuthModule } from './routes/auth/auth.module'
import { PermissionModule } from './routes/permission/permission.module'
import { RoleModule } from './routes/role/role.module'
import { ProfileModule } from './routes/profile/profile.module'
import { UserModule } from './routes/user/user.module'
import { MediaModule } from './routes/media/media.module'
import { BrandModule } from './routes/brand/brand.module'
import { CategoryModule } from './routes/category/category.module'
import { ProductModule } from './routes/product/product.module'
import { CartModule } from './routes/cart/cart.module'
import { OrderModule } from './routes/order/order.module'
import { PaymentModule } from './routes/payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import { PaymentConsumer } from './queues/payment.consumer'
import { WebsocketModule } from './websockets/websocket.module'

@Module({
	imports: [
		BullModule.forRoot({
			connection: {
				// host:"localhost",
				// port:6379
				host: 'redis-17549.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com',
				port: 17549,
				username: 'default',
				password: 'g8zkLLvGOMbKwHt58S9JZW7laUIAZZCb',
			},
		}),
		WebsocketModule,
		SharedModule,
		AuthModule,
		PermissionModule,
		RoleModule,
		ProfileModule,
		UserModule,
		MediaModule,
		BrandModule,
		CategoryModule,
		ProductModule,
		CartModule,
		OrderModule,
		PaymentModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useClass: CustomZodValidationPipe,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ZodSerializerInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		PaymentConsumer,
	],
})
export class AppModule {}
