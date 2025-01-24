import { InjectQueue } from "@nestjs/bull";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Queue } from "bull";
import { PrismaService } from "prisma/prisma.service";
import { AUTH_QUEUE } from "src/constants/constants";
import { AuthPasswordDto } from './DTO/auth.password.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService{
    private readonly logger = new Logger(AuthService.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(private readonly pr:PrismaService,@InjectQueue(AUTH_QUEUE) private readonly authQueue: Queue){
        this.prisma = pr.user;
    };

    private async findUser(id:number):Promise<User>{
        try{
            const findUser = await this.prisma.findUnique({
                where:{
                    id:id
                }
            });

            if(!findUser){
                this.logger.error(`We can't find the user with this id: ${id}`);
                throw new HttpException(`We can't find the user with this id: ${id}`,401);
            };

            return findUser;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    private async validateInstace(instance:object){
        const instanceErrors = await validate(instance);

        if(instanceErrors.length > 0){
            this.logger.error('Validation failed!');
            throw new HttpException(
              `${instanceErrors.map((err) => Object.values(err.constraints)).join(', ')}`,
              400,
            );
        };
    };

    public async creatUserWithGooglePassword(id:number,newPassword:AuthPasswordDto):Promise<User>{
        try{
            const findUser = await this.findUser(Number(id));

            const realNewPassword = plainToInstance(AuthPasswordDto,newPassword);

            const updateUserWithGooglePass = await this.prisma.update({
                where:{
                    id:findUser.id,
                },
                data:{
                    password:realNewPassword.newPassword,
                },
            });

            this.logger.debug(`Working in a new Auth Queue!`);
            const passJob = await this.authQueue.add(AUTH_QUEUE,{
                id:updateUserWithGooglePass.id,
                newPassword:updateUserWithGooglePass.password,
            });
            this.logger.debug(`Processed job: ${JSON.stringify(passJob.data)}`);

            return updateUserWithGooglePass;

        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async changeUserPassword(newPassword:AuthService,id:number):Promise<User>{
        try{
            const findUser = await this.findUser(Number(id));

            const realNewPassword = plainToInstance(AuthPasswordDto,newPassword);

            const passwordAtt = await this.prisma.update({
                where:{
                    id:findUser.id
                },
                data:{
                    password:realNewPassword.newPassword,
                },
            });

            this.logger.debug(`Working in a new Auth Queue!`);
            const cahngePassJob = await this.authQueue.add(AUTH_QUEUE,{
                jobId:passwordAtt.id,
                jobPass:passwordAtt.password,
            });
            this.logger.debug(`Processed job: ${JSON.stringify(cahngePassJob.data)}`);

            return passwordAtt;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async findUserByTheEmail(email:string):Promise<User>{
        try{
            const userWithSpecifiedEmail = await this.prisma.findUnique({
                where:{
                    email:email
                }
            });

            return userWithSpecifiedEmail;

        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};