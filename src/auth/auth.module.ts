import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { GoogleGuard } from './guards/google.auth.guard';
import { ConfigModule } from '@nestjs/config';
import authGoogleConfig from './config/auth.google.config';
import { PassportModule } from '@nestjs/passport';
import { AuthGuard } from './guards/auth.guard';
import { BullModule } from '@nestjs/bull';
import { AUTH_QUEUE } from 'src/constants/constants';
import { AuthProcessor } from './processor/auth.processor';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: "30 days"
            }
        }),
        ConfigModule.forRoot({
            load:[authGoogleConfig]
        }),
        PassportModule.register({ defaultStrategy: 'google' }),
        BullModule.registerQueue({
            name:AUTH_QUEUE,
        }),
    ],
    controllers: [AuthController],
    providers:[GoogleGuard,AuthGuard,AuthProcessor,AuthController],
})
export class AuthModule { };
