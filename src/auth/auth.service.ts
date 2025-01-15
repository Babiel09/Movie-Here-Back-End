import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class AuthService{
    private readonly logger = new Logger(AuthService.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(private readonly pr:PrismaService){
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

    public async changeUserWithGooglePhoto(id:number,newPassword:string):Promise<User>{
        try{
            const findUser = await this.findUser(Number(id));

            const updateUserWithGooglePass = await this.prisma.update({
                where:{
                    id:findUser.id,
                },
                data:{
                    password:newPassword,
                },
            });

            return updateUserWithGooglePass;

        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async changeUserPassword(newPassword:string,id:number):Promise<User>{
        try{
            const findUser = await this.findUser(Number(id));

            const passwordAtt = await this.prisma.update({
                where:{
                    id:findUser.id
                },
                data:{
                    password:newPassword,
                },
            });

            return passwordAtt;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};