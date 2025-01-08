import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { SendEmail } from "./DTO/email.dto";

@Injectable()
export class EmailService{
    private readonly logger = new Logger(EmailService.name);
    constructor(private readonly mailerService:MailerService){};

    public async sendEmail(data:SendEmail):Promise<any>{
        try{
            const tryToSendEmail = await this.mailerService.sendMail({
                to:data.to,
                from:data.from,
                subject:data.subject,
                text:data.text,
                html:data.html
            });

            return tryToSendEmail;
        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};