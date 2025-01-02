import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { USER_QUEUE } from './constants/constants';
import { UserModule } from './user/user.module';


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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
