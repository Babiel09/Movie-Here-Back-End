import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis{
    private readonly logger = new Logger(RedisService.name);
    constructor(){
        super();
        if(super.on){   
            this.logger.log("Redis ON!");
        }else{
            this.logger.error("Redis OFF!");
        };
    };
};
