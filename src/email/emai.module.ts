import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { SendEmail } from "./DTO/email.dto";

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
    ],
    controllers:[EmailController],
    providers:[EmailService,SendEmail],
    exports:[EmailService,SendEmail]
})
export class EmailModule{};