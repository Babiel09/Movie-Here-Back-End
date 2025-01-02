import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { USER_QUEUE } from './constants/constants';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      redis:{
        host:process.env.REDIS_HOST,
        port:Number(process.env.REDIS_PORT),
      }
    }),
    BullModule.registerQueue({
      name:USER_QUEUE
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
