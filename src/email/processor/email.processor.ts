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
};