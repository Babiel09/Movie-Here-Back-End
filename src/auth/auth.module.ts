import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';

@Module({
    imports:[UserModule],
    controllers:[],
})
export class AuthModule {};
