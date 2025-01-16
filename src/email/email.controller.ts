import { Body, Controller, Logger, Param, Post, Res } from "@nestjs/common";
import { EmailService } from "./email.service";
import { Response } from "express";

@Controller("email")
export class EmailController{
    private readonly logger = new Logger(EmailController.name);
    constructor(private readonly emailService:EmailService){};

    @Post("/v1/send")
    private async sendOneEmail(@Body("email")email:string,@Res()res:Response):Promise<Response>{
        try{
            const newEmail = await this.emailService.sendEmailToVerify(email);

            return res.status(202).json({server:`Email sent for:${email}`});

        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Post("/v1/changePass")
    private async sendPassEmail(@Res()res:Response,@Body("email")email:string):Promise<Response>{
        try{
            const newEmail = await this.emailService.sendEmailChangePassword(email);

            return res.status(202).json({server:`Email sent for:${email}`});
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Post("/v1/generatePass")
    private async sendGeneratePass(@Res()res:Response,@Body("email")email:string):Promise<Response>{
        try{

            const newEmail = await this.emailService.emailToConfirmUser(email);

            return res.status(202).json({server:`Email sent for:${email}`});

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };
};