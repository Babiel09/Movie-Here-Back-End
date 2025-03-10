import { Body, Controller, Delete, Get, Injectable, Logger, Param, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreationUser } from "./DTO/user.dto";
import { Response } from "express";
import { PrismaService } from "prisma/prisma.service";
import { Prisma, Roles } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { EmailService } from "src/email/email.service";
import { UserGuard } from "./guards/user.guard";
import { InjectQueue } from "@nestjs/bull";
import { USER_QUEUE } from "src/constants/constants";
import { Queue } from "bull";
import { UserCreateCommnetDto } from './DTO/user.createCommnet.dto';
import { UserCreateDescriptionDto } from './DTO/user.createDescription.dto';
import { AppService } from "src/app.service";


@Injectable()
@Controller("user")
export class UserController{
    private readonly logger = new Logger(UserController.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(
        private readonly userService:UserService, 
        private readonly pr:PrismaService,
        private readonly emailService:EmailService,
        @InjectQueue(USER_QUEUE)private readonly userQueue:Queue,
        private readonly appService:AppService
    ){
        this.prisma = pr.user;
    };

    @Post("/v1")
    private async createUser(@Body() data:CreationUser, @Res() res:Response):Promise<Response>{
        try{
            const newUser = await this.userService.InsertUser(data);

            const senhaNova = await this.appService.hashRandomSalt(newUser.password);

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

    @Delete("/v2/delete/:id")
    private async deleteUser(@Param("id")id:number,@Res()res:Response):Promise<Response>{
        try{
            await this.userService.DeleteUser(Number(id));

            return res.status(204).json({server:"User deleted!"});
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Patch("/v2/verify/:id")
    private async verifyUser(@Param("id")id:number,@Res()res:Response):Promise<Response>{
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

            await this.emailService.sendEmail(userVerified.email);

            this.logger.log(`Email sucefully send and the user is now verified!`);

            return res.status(202).send(userVerified);            

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Patch("/v3/role/:id")
    @UseGuards(UserGuard)
    private async changeUserRole(@Body("role")role:Roles,@Param("id")id:number,@Res()res:Response):Promise<Response>{
        try{
            this.logger.warn(`This route needs **security_acess** as header param!`);
            
            const changeUserRole = await this.userService.ChangeUserRole(role,Number(id));

            this.logger.debug(`New Role: ${changeUserRole.role}`);
            return res.status(200).send(changeUserRole);

        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Post("/v1/newComment")
    private async createComment(@Query("userId")userId:number,@Query("movieId")movieId:number,@Body("userComment")userComment:string,@Res()res:Response):Promise<Response>{
        try{

            let userCommentWithDTO = new UserCreateCommnetDto();

            userCommentWithDTO.userComment = userComment;

           const createNewComment = await this.userService.CreateAComment(Number(movieId),Number(userId),userCommentWithDTO);

           return res.status(201).send(createNewComment);

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };


    @Get("/v1/:id")
    private async getSpecifiedUser(@Param("id")id:number, @Res()res:Response):Promise<Response>{
        try{
            const specifiedUser = await this.userService.SelectOne(Number(id));

            if(!specifiedUser){
                this.logger.error(`User not found, please check this id!`);
                return res.status(400).json({server:`User not found, please check this id!`});
            };

            return  res.status(200).send(specifiedUser);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Patch("/v2/description/:id")
    private async createUserDescription(@Res()res:Response,@Body("description")description:string,@Param("id")id:number):Promise<Response>{
        try{
            if(!description){
                this.logger.error(`You need to input a description!`);
                return res.status(400).json({server:"You need to input a description!"});
            };

            let descriptionDTO = new UserCreateDescriptionDto();

            descriptionDTO.description = description;

            const newDescription = await this.userService.CreateDescription(Number(id),descriptionDTO);

            return res.status(202).send(newDescription);

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1")
    private async findAllUsers(@Res()res:Response):Promise<Response>{
        try{
            const allUsers = await this.userService.SelectAll();
            return res.status(200).send(allUsers);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };


    @Post("/v1/photo/:id")
    public async changePhoto(@Res()res?:Response,@Body("photo")photo?:string,@Param("id")id?:number):Promise<Response>{
        try{

            let arrayBuffer = await this.userService.FingThePhotoInWeb(photo);

            const bytes = new Uint8Array(arrayBuffer);

            this.logger.debug(typeof bytes);
            
            const userPhoto = await this.prisma.update({
                where:{
                    id:Number(id),
                },
                data:{
                    photo:bytes,
                },
            });

            this.logger.debug("Working in a new job in the User Queue");
            const photoJob = await this.userQueue.add(USER_QUEUE,{
                jobId:userPhoto.id,
                jobData:userPhoto.photo,
            });
            this.logger.debug(`Processed job: ${JSON.stringify(photoJob.data)}`);
            
            return res.status(202).json({server:`Your profile picture is now changed!`});

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/photo/:id")
    public async getThePhoto(@Res()res?:Response,@Param("id")id?:number):Promise<Response>{
        try{
            const user = await this.userService.SelectOne(Number(id));

            res.setHeader("Content-Type", "image/jpeg");

            this.logger.debug("Working in a new job in the User Queue");
            const photoJob = await this.userQueue.add(USER_QUEUE,{
                jobId:user.id,
                jobData:Buffer.from(user.photo),
            });
            this.logger.debug(`Processed job: ${JSON.stringify(photoJob.data)}`);
            
            return res.status(202).send(Buffer.from(user.photo));


        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };
};