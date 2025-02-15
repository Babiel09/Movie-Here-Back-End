import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  controllers: [],
  providers: [RedisService],
  exports:[RedisService]
})
export class RedisModule {}
