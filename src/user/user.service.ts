import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { PrismaService } from "prisma/prisma.service";
import { CreationUser } from "./DTO/user.dto";

@Injectable()
export class UserService{
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    private readonly logger = new Logger(UserService.name);
    constructor(private readonly pr:PrismaService){
        this.prisma = pr.user;
    };

    public async InsertUser(data:CreationUser):Promise<User>{
        try{

            const verifyEmail = await this.prisma.findUnique({
                where:{
                    email:data.email,
                },
            });

            if(verifyEmail){
                this.logger.error(`Email(${data.email} is already in your DB!)`);
                throw new HttpException(`Email(${data.email} is already in your DB!)`,400);
            };

            const tryToCreate = await this.prisma.create({
                data:data
            });
        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,500);
        }
    };

};