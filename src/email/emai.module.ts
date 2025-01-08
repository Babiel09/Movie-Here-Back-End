import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { SendEmail } from "./DTO/email.dto";
import { BullModule } from "@nestjs/bull";
import { EMAIL_QUEUE } from "src/constants/constants";
import { EmailProcessor } from "./processor/email.processor";

@Module({
    imports:[
        MailerModule.forRoot({
            transport:{
              host:"smtp.gmail.com",
              auth:{
                user:process.env.GMAIL_USER,
                pass:process.env.GMAIL_PASS,
              }
            }
          }),
          BullModule.registerQueue({
            name:EMAIL_QUEUE
          }),
    ],
    controllers:[EmailController],
    providers:[EmailService,SendEmail,EmailProcessor],
    exports:[EmailService,SendEmail]
})
export class EmailModule{};