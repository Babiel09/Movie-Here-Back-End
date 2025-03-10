import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MovieModule } from './movies/movie.module';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { AppService } from './app.service';


@Module({
  imports: [
    MovieModule,
    PrismaModule,
    EmailModule,
    BullModule.forRoot({
      redis:{
        host:process.env.REDIS_HOST,
        port:Number(process.env.REDIS_PORT),
      }
    }),
    UserModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [],
  providers: [AppService],
  exports:[AppService]
})
export class AppModule {};
