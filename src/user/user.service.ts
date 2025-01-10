import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Prisma, Roles, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { PrismaService } from "prisma/prisma.service";
import { CreationUser } from "./DTO/user.dto";
import { InjectQueue } from "@nestjs/bull";
import { USER_QUEUE } from "src/constants/constants";
import { Queue } from "bull";
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from "@nestjs/axios";
import { Axios, AxiosError } from "axios";
import { error } from "console";

@Injectable()
export class UserService{
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    private readonly logger = new Logger(UserService.name);
    constructor(
        private readonly pr:PrismaService,
        @InjectQueue(USER_QUEUE) private readonly userQueue:Queue,
        private readonly httpService:HttpService,
    ){
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

            return tryToCreate;

        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async SelectAll():Promise<User[]>{
        try{
            const tryToGetAllUsers = await this.prisma.findMany();

            return tryToGetAllUsers;
        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async SelectOne(id:number):Promise<User>{
        try{
            const tryToFindUser = await this.prisma.findUnique({
                where:{
                    id:id,
                },
            });

            return tryToFindUser;
        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };


    public async Login(email:string):Promise<User>{
        try{
            const searchUserEmail = this.prisma.findUnique({
                where:{
                    email:email
                }
            });

            this.logger.debug("Working in a new job in the User Queue");
            const loginJob = await this.userQueue.add(USER_QUEUE,{
                jobId:(await searchUserEmail).id,
                jobName:`Login Job${(await searchUserEmail).id}`,
            }); 
            this.logger.debug(`Processed job: ${JSON.stringify(loginJob.data)}`);

            return searchUserEmail;
        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async UpdateDescription(id:number,description:string):Promise<User>{
        try{
            const tryToUpdate = await this.prisma.update({
                where:{
                    id:id
                },
                data:{
                    description:description
                }
            });

            return tryToUpdate;
        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async ChangeUserRole(newRole:Roles,id:number):Promise<User>{
        try{

            const findUser = await this.prisma.findUnique({
                where:{
                    id:id
                }
            });

            if(!findUser){
                this.logger.error(`We can't find the user with this id:${findUser.id}`);
                throw new HttpException(`We can't find the user with this id:${findUser.id}`,400);
            };

            const tryToChangeTheRole = await this.prisma.update({
                where:{
                    id:Number(findUser.id),
                },
                data:{
                    role:newRole,
                },
            });

            return tryToChangeTheRole; 

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async DeleteUser(id:number):Promise<User>{
        try{

            const findUserByid = await this.prisma.findUnique({
                where:{
                    id:id
                }
            });

            if(!findUserByid){
                this.logger.error(`Invalid id: ${id}`);
                throw new HttpException(`Invalid id: ${id}`,400);
            };

            const deleteUser = await this.prisma.delete({
                where:{
                    id:findUserByid.id
                }
            });

            return deleteUser;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };


    public async FingThePhotoInWeb(photo:string):Promise<ArrayBuffer>{
       const {data} =  await firstValueFrom(
         this.httpService.get<ArrayBuffer>(photo, {responseType: 'arraybuffer' })
         .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`${error}`);
              throw new HttpException(`${error.message}`,error.status);
            }),
          ),
       );
       return data;
    };
};