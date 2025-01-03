import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { GoogleGuard } from './guards/auth.guards';
import { ConfigModule } from '@nestjs/config';
import authGoogleConfig from './config/auth.google.config';
import { PassportModule } from '@nestjs/passport';
import { AuthGuard } from './guards/auth.guard';

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
    ],
    controllers: [AuthController],
    providers:[GoogleGuard,AuthGuard],
})
export class AuthModule { };
