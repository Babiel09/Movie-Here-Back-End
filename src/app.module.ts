import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PismaModule } from 'prisma/prisma.module';
import { USER_QUEUE } from './constants/constants';


@Module({
  imports: [
    PismaModule,
    BullModule.forRoot({
      redis:{
        host:process.env.REDIS_HOST,
        port:Number(process.env.REDIS_PORT),
      }
    }),
    BullModule.registerQueue({
      name:USER_QUEUE
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
