import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UserProcessor } from './processor/user.processor';
import { BullModule } from '@nestjs/bull';
import { USER_QUEUE } from 'src/constants/constants';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { UserGuard } from './guards/user.guard';
import { HttpModule } from '@nestjs/axios';


@Module({
    imports:[
        PrismaModule,
        HttpModule,
        BullModule.registerQueue({
            name:USER_QUEUE
        }),
        EmailModule,
        JwtModule.register({
              secret:process.env.JWT_SECRET,
              signOptions:{
                expiresIn:"30 days"
              }
            }),
    ],
    controllers:[UserController],
    providers:[UserService,UserProcessor,UserGuard,UserController],
    exports:[UserService],
})
export class UserModule {};
