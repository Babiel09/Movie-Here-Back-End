import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UserProcessor } from './processor/user.processor';
import { BullModule } from '@nestjs/bull';
import { USER_QUEUE } from 'src/constants/constants';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports:[
        PrismaModule,
        BullModule.registerQueue({
            name:USER_QUEUE
        }),
        JwtModule.register({
              secret:process.env.JWT_SECRET,
              signOptions:{
                expiresIn:"30 days"
              }
            }),
    ],
    controllers:[UserController],
    providers:[UserService,UserProcessor],
    exports:[UserService],
})
export class UserModule {};
