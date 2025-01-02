import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PismaModule } from 'prisma/prisma.module';


@Module({
  imports: [
    PismaModule,
    BullModule.forRoot({
      redis:{
        host:process.env.REDIS_HOST,
        port:Number(process.env.REDIS_PORT),
      }
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
