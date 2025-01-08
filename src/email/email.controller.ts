import { Body, Controller, Logger, Post, Res } from "@nestjs/common";
import { EmailService } from "./email.service";
import { SendEmail } from "./DTO/email.dto";
import { Response } from "express";

@Controller("email")
export class EmailController{
    private readonly logger = new Logger(EmailController.name);
    constructor(private readonly emailService:EmailService){};

    @Post("/v1/send")
    private async sendOneEmail(@Body()data:SendEmail,@Res()res:Response):Promise<Response>{
        try{
            const email = await this.emailService.sendEmail(data);

            return res.status(202).json({server:`Done`});

        } catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };
};