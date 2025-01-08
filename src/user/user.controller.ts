import { Body, Controller, Get, Logger, Param, Patch, Post, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import * as bcrypt from "bcrypt";
import { CreationUser } from "./DTO/user.dto";
import { Response } from "express";
import { PrismaService } from "prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { SendEmail } from "src/email/DTO/email.dto";
import { EmailService } from "src/email/email.service";
@Controller("user")
export class UserController{
    private readonly logger = new Logger(UserController.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(private readonly userService:UserService, private readonly pr:PrismaService,private readonly emailService:EmailService){
        this.prisma = pr.user;
    };

    @Post("/v1")
    private async createUser(@Body() data:CreationUser, @Res() res:Response):Promise<Response>{
        try{
            const newUser = await this.userService.InsertUser(data);

            const senhaNova = await bcrypt.hash(newUser.password,12)

            const realNewUser = await this.prisma.update({
                where:{
                    id:Number(newUser.id),
                },
                data:{
                    password:senhaNova
                }
            });

            return res.status(201).send(realNewUser);
            
        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Patch("/v2/verify/:id")
    private async verifyUser(@Param("id")id:number,@Body()data:SendEmail,@Res()res:Response):Promise<Response>{
        try{
            const userToVerifyEmail = await this.prisma.findUnique({
                where:{
                    id:Number(id),
                },
            });

            let verifyTrue = userToVerifyEmail.verified = true;

            const userVerified = await this.prisma.update({
                where:{
                    id:Number(id),
                },
                data:{
                    verified:verifyTrue,
                },
            });

            this.logger.debug(`${userVerified.verified}`);

            if(data.to !== userVerified.email){
                this.logger.error(`The data recipient is not the same of the user with this id:${userVerified.id}`);
            };

            const email = await this.emailService.sendEmail(data);

            this.logger.log(`Email sucefully send and the user is now verified!`);

            return res.status(202).send(userVerified);            

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/:id")
    private async getSpecifiedUser(@Param("id")id:number, @Res()res:Response):Promise<Response>{
        try{
            const specifiedUser = await this.userService.SelectOne(Number(id));
            return  res.status(200).send(specifiedUser);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Patch("/v2/description/:id")
    private async changeUserDescription(@Res()res:Response,@Body("description")description:string,@Param("id")id:number):Promise<Response>{
        try{

            if(!description){
                this.logger.error(`You need to input a description!`);
            };

            const newDescription = await this.userService.UpdateDescription(Number(id),description);

            return res.status(202).send(newDescription);

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };
};