import { Body, Controller, Logger, Post, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import * as bcrypt from "bcrypt";
import { CreationUser } from "./DTO/user.dto";
import { Response } from "express";
import { PrismaService } from "prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
@Controller("user")
export class UserController{
    private readonly logger = new Logger(UserController.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(private readonly userService:UserService, private readonly pr:PrismaService){
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
            return res.status(500).json({server:`${err.message}`});
        };
    };
};