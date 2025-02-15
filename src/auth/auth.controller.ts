import { Body, Controller, Get, HttpException, Logger, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./guards/auth.guard";
import { InjectQueue } from "@nestjs/bull";
import { AUTH_QUEUE } from "src/constants/constants";
import { Queue } from "bull";
import { GoogleGuard } from "./guards/google.auth.guard";
import { GoogleStrategy } from "./google/auth.google.strategy";
import { PrismaService } from "prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { AuthService } from "./auth.service";
import { EmailService } from "src/email/email.service";
import { UserLoginDto } from '../user/DTO/user.login.dto';
import { AppService } from "src/app.service";

@Controller("auth")
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(
        private readonly userService: UserService, private readonly jwtService: JwtService,
        @InjectQueue(AUTH_QUEUE) private readonly authQueue: Queue, private readonly pr: PrismaService,
        private readonly authservice: AuthService,
        private readonly emailService: EmailService,
        private readonly appService:AppService
    ) {
        this.prisma = pr.user;
    };

    @Post("/v2/login")
    private async login(@Res() res: Response, @Body() data: UserLoginDto): Promise<Response> {
        try {
            if (!data.email) {
                this.logger.error(`You need to pass the email!`);
                return res.status(400).json({ server: `You need to pass the email!` });
            };

            if (!data.password) {
                this.logger.error(`You need to pass the password!`);
                return res.status(400).json({ server: `You need to pass the password!` });
            };

            const findUserByEmail = await this.userService.Login(data);

            if(findUserByEmail.twoStetps){
                const sentEmail = await this.emailService.veriFyUserInLogin(findUserByEmail.email);

                return res.status(202).json({server:`Email with the 4 digits is sent`});
            };

            const verifyPassword = await bcrypt.compare(data.password, findUserByEmail.password);

            if (!verifyPassword) {
                this.logger.error(`The password doesn't match!`);
                return res.status(401).json({ server: `Invalid credentials!` });
            };

            const payload = { 
                id: findUserByEmail.id, 
                name: findUserByEmail.name, 
                email: findUserByEmail.email, 
                description: findUserByEmail.description, 
                role: findUserByEmail.role, 
                digits:findUserByEmail.digits,
                verified: findUserByEmail.verified, 
                twoSteps: findUserByEmail.twoStetps, 
            };

            const token = await this.jwtService.signAsync(payload);

            return res.status(202).send(token);

        } catch (err) {
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({ server: `${err.message}` });
        };
    };


    @Post("/v3/decode")
    @UseGuards(AuthGuard)
    public async decodeToken(@Body("token") token: string, @Res() res?: Response): Promise<Response> {
        try {

            this.logger.warn(`This route needs **api_key** as header param!`);

            const verifyToken = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET
                },
            );

            if (!verifyToken) {
                this.logger.error(`Token is invalid`);
                return res.status(401).json({ server: `The token is invalid!` });
            };

            const decodifiedTOken = await this.jwtService.decode(token);

            this.logger.debug(`Working in a new Auth Queue!`);
            const job = await this.authQueue.add(AUTH_QUEUE, {
                jobId: decodifiedTOken.id,
                jobName: `Decode token${decodifiedTOken.id}`
            });

            this.logger.debug(`Processed job: ${JSON.stringify(job.data)}`);

            return res.status(202).send(decodifiedTOken);
        } catch (err) {
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({ server: `${err.message}` });
        };
    };

    @Get("/v4/google/login")
    @UseGuards(GoogleGuard)
    private async googleLogin() { };

    @Get(process.env.GOOGLE_CALLBACK_URL_CONTROLLER)
    @UseGuards(GoogleGuard)
    public async googleCalback(@Res() res: Response, @Req() req): Promise<Response | void>  {
        const user = req.user; //Dados do oauth

        return res.status(202).json({ token: `${user.jwtToken}` });
    };

    @Patch("/v4/google/newPassword/:id")
    private async insertAUserForTheUser(@Res() res: Response, @Body("password") password: string, @Param("id") id: number): Promise<Response> {
        try {

            if (!password) {
                this.logger.error(`You need to insert the password!`);
                return res.status(401).json({ server: "You need to insert the password!" });
            };

            const encryptedPassword = await this.appService.hashRandomSalt(password);

            this.logger.debug(encryptedPassword);

            await this.authservice.creatUserWithGooglePassword(Number(id), encryptedPassword);

            return res.status(202).json({ server: "New password added with sucess!" });

        } catch (err) {
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({ server: `${err.message}` });
        };
    };

    @Patch("/v4/changePassword/:id") //Feito
    private async changeUserPassword(@Param("id") id: number, @Body("newPassword") password: string, @Body("oldPassword") oldPassword: string, @Res() res: Response): Promise<Response> {
        try {

            if (!password) {
                this.logger.error(`You need to insert the password!`);
                return res.status(401).json({ server: "You need to insert the password!" });
            };

            const userToChangeThePassWord = await this.userService.SelectOne(Number(id));

            const verifyOldPassword = await bcrypt.compare(oldPassword, userToChangeThePassWord.password);

            if (!verifyOldPassword) {
                this.logger.error(`Your old password is incorrect`);
                return res.status(401).json({ server: `Your old password is incorrect!` });
            };


            if (oldPassword === password) {
                this.logger.error(`The old password can't be the new password, please insert a new password!`);
                return res.status(401).json({ server: `The old password can't be the new password, please insert a new password!` });
            };

            const encryptedPassword = await this.appService.hashRandomSalt(password);

            await this.authservice.changeUserPassword(encryptedPassword,Number(id));

            return res.status(202).json({ server: "Password sucefully changed!" });

        } catch (err) {
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({ server: `${err.message}` });
        };
    };

    @Patch("/v4/createANewPassword/:id")
    private async createANewPassword(@Param("id") id: number, @Body("password") password: string, @Res() res: Response): Promise<Response> {
        try {
            if (!password) {
                this.logger.error(`You need to insert the password!`);
                return res.status(401).json({ server: "You need to insert the password!" });
            };

            const userToChangeThePassWord = await this.userService.SelectOne(Number(id));

            const encryptedPassword = await this.appService.hashRandomSalt(password);

            await this.authservice.changeUserPassword(encryptedPassword, Number(id));

            return res.status(202).json({ server: "Password sucefully changed!" });
        } catch (err) {
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({ server: `${err.message}` });
        };
    };

    @Get("/v3/confirm")
    private async userDigitis(@Query("digits") digits: string, @Query("email") email: string, @Res() res: Response): Promise<Response> {
        try {

            if (!digits) {
                this.logger.error(`You need to insert the digits!`);
            };

            const digitArray = digits.split(",").map(Number);

            const findUserByEmail = await this.authservice.findUserByTheEmail(email);
            
            const isValidDigits = findUserByEmail.digits.length === digitArray.length &&
            findUserByEmail.digits.map((val, index) => val === digitArray[index]);

            if(!isValidDigits){
                this.logger.error(`Invalid Digits!`);
                return res.status(401).json({server:`Invalid Digits!`});
            };

            const sendEmail = await this.emailService.confirmVerify(findUserByEmail.email);

           if(!sendEmail){
            this.logger.error(`Email não enviado!`);
           };

        const wthOutDigitis:number[] = [];
        
        this.logger.debug(`Email enviado!`);

            const payload = { 
                id: findUserByEmail.id, 
                name: findUserByEmail.name, 
                email: findUserByEmail.email, 
                description: findUserByEmail.description, 
                role: findUserByEmail.role, 
                digits:wthOutDigitis,
                verified: findUserByEmail.verified, 
                twoSteps: findUserByEmail.twoStetps, 
            };

            const token = await this.jwtService.signAsync(payload);

            return res.status(202).json({token:`${token}`});

        } catch (err) {
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({ server: `${err.message}` });
        };
    };

};