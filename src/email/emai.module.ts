import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { MailerModule } from "@nestjs-modules/mailer";

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
    providers:[EmailService],
    exports:[EmailService]
})
export class EmailModule{};