import { Process, Processor } from "@nestjs/bull";
import { EMAIL_QUEUE } from "src/constants/constants";
import { EmailService } from "../email.service";
import { Job } from "bull";

@Processor(EMAIL_QUEUE)
export class EmailProcessor{
    constructor(private readonly emailService:EmailService){};

    @Process("send-email")
    private async workerEmail(job:Job){
        await this.emailService.sendEmail(job.data);
    };

    @Process("send-email-verify")
    private async workerEmailVerify(job:Job){
        await this.emailService.sendEmailToVerify(job.data);
    };

    @Process("send-email-change-password")
    private async wokerPasswordEmailChange(job:Job){
        await this.emailService.sendEmailChangePassword(job.data);
    };

    @Process("email-confirm-user")
    private async workerConfirmUser(job:Job){
        await this.emailService.emailToConfirmUser(job.data);
    };

    @Process("veriFy-user-login")
    private async workerVerifyUser(job:Job){
        await this.emailService.veriFyUserInLogin(job.data);
    };

    @Process("confirm-verify")
    private async workerConfirmVerify(job:Job){
        await this.emailService.confirmVerify(job.data);
    };


};