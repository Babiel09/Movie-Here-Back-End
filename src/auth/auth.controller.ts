import { Body, Controller, Get, Logger, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./guards/auth.guard";
import { InjectQueue } from "@nestjs/bull";
import { AUTH_QUEUE } from "src/constants/constants";
import { Queue } from "bull";

@Controller("auth")
export class AuthController{
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private readonly userService:UserService,private readonly jwtService:JwtService,
        @InjectQueue(AUTH_QUEUE) private readonly authQueue:Queue,
    ){};

    @Post("/v2/login")
    private async login(@Res()res:Response, @Body()data:{email:string,password:string}):Promise<Response>{
        try{
            if(!data.email){
                this.logger.error(`You need to pass the email!`);
                return res.status(400).json({server:`You need to pass the email!`});
            };

            if(!data.password){
                this.logger.error(`You need to pass the password!`);
                return res.status(400).json({server:`You need to pass the password!`});
            };

            const findUserByEmail = await this.userService.Login(data.email);

            const verifyPassword = await bcrypt.compare(data.password,findUserByEmail.password);

            if(verifyPassword === false){
                this.logger.error(`The password doesn't matc!`);
                return res.status(401).json({server:`Invalid credentials!`});
            };

            const token = this.jwtService.sign(findUserByEmail);

            return res.status(202).send(token);

        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(500).json({server:`${err.message}`});
        };
    };


    @Post("/v3/decode")
    @UseGuards(AuthGuard)
    public async decodeToken(@Body("token")token:string,@Res()res?:Response):Promise<Response>{
        try{
            const decodifiedTOken = await this.jwtService.decode(token);

            this.logger.debug(`Working in a new Auth Queu!`);
            const job = await this.authQueue.add(AUTH_QUEUE,{
                jobId:decodifiedTOken.id,
                jobName:`Decode token${decodifiedTOken.id}`
            });

            this.logger.debug(`Processed job: ${JSON.stringify(job.data)}`);

            return res.status(202).send(decodifiedTOken);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(500).json({server:`${err.message}`});
        };
    };

  
};