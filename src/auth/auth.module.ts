import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: "30 days"
            }
        }),
    ],
    controllers: [AuthController],
})
export class AuthModule { };
