import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { SendEmail } from "./DTO/email.dto";
import { InjectQueue } from "@nestjs/bull";
import { EMAIL_QUEUE } from "src/constants/constants";
import { Queue } from "bull";

@Injectable()
export class EmailService{
    private readonly logger = new Logger(EmailService.name);
    constructor(private readonly mailerService:MailerService,@InjectQueue(EMAIL_QUEUE)private readonly emailQueue:Queue){};

    public async sendEmail(data:SendEmail):Promise<any>{

        try{
            const tryToSendEmail = await this.mailerService.sendMail({
                to:data.to,
                from:data.from,
                subject:data.subject,
                text:data.text,
                html:data.html
            });

            this.logger.debug("Working in a new job in the Email Queue");
            
            const emailJob = await this.emailQueue.add(EMAIL_QUEUE,{
               jobTo:data.to,
               jobFrom:data.from,
               jobSubject:data.subject,
               jobText:data.text,
               jobHtml:data.html,
            });

            this.logger.debug(`Processed job: ${JSON.stringify(emailJob.data)}`);

            return tryToSendEmail;
        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};