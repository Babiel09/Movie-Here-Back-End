import { Body, Controller, Logger, Post, Res } from "@nestjs/common";
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

            return res.status(202).json({server:`Email sended for:${email}`});

        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };
};