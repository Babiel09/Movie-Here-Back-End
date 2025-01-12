import { Body, Controller, Get, HttpException, Logger, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./guards/auth.guard";
import { InjectQueue } from "@nestjs/bull";
import { AUTH_QUEUE } from "src/constants/constants";
import { Queue } from "bull";
import { GoogleGuard } from "./guards/google.auth.guard";

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

            const payload = {id:findUserByEmail.id, name: findUserByEmail.name ,email: findUserByEmail.email, description: findUserByEmail.description,role: findUserByEmail.role, verify: findUserByEmail.verified}

            const token = await this.jwtService.signAsync(payload);

            return res.status(202).send(token);

        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };


    @Post("/v3/decode")
    @UseGuards(AuthGuard)
    public async decodeToken(@Body("token")token:string,@Res()res?:Response):Promise<Response>{
        try{

            this.logger.warn(`This route needs **api_key** as header param!`);

            const verifyToken = await this.jwtService.verifyAsync(
                token,
                {

                  secret:process.env.JWT_SECRET
                },
            );

            if(!verifyToken){
                this.logger.error(`Token is invalid`);
                return res.status(401).json({server:`The token is invalid!`});
            };

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
            return res.status(err.status).json({server:`${err.message}`});
        };
    };
    
    @Get("/v4/google/login")
    @UseGuards(GoogleGuard)
    private async googleLogin(){};
    
    @Get(process.env.GOOGLE_CALLBACK_URL_CONTROLLER)
    @UseGuards(GoogleGuard)
    private async googleCalback(){};

  
};