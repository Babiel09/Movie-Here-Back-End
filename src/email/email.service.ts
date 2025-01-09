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

    public async sendEmail(email:string):Promise<EmailService>{

        try{
            const tryToSendEmail = await this.mailerService.sendMail({
                to:email,
                from:process.env.GMAIL_USER,
                subject:"Verificação da Conta",
                text:"Sua conta está verificada agora você pode voltar para o site!",
                html:`

        <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

        <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Movie Here</h1>
        </div>
    
        <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
            <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                Sua conta está verificada agora você pode voltar para o site!
            </p>
            </div>
        </div>
    </div>
                `
            });

            this.logger.debug("Working in a new job in the Email Queue");
            
            const emailJob = await this.emailQueue.add(EMAIL_QUEUE,{
               jobTo:email,
               jobFrom:process.env.GMAIL_USER,
               jobSubject:"Verificação da Conta",
               jobText:"Sua conta está verificada agora você pode voltar para o site!",
               jobHtml:`
        <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

        <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Movie Here</h1>
        </div>
    
        <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
            <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                Sua conta está verificada agora você pode voltar para o site!
            </p>
            </div>
        </div>
    </div>
               `
            });

            this.logger.debug(`Processed job: ${JSON.stringify(emailJob.data)}`);

            return tryToSendEmail;
        } catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async sendEmailToVerify(userEmail:string):Promise<EmailService>{
        try{
            const tryToSendEmailForTheUser  = await this.mailerService.sendMail({
                to:userEmail,
                from:process.env.GMAIL_USER,
                subject:"Verificar sua Conta",
                text:"Clique no botão abaixo para verificar sua conta em nosso website!",
                html:`

      <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

        <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Movie Here</h1>
        </div>
    
        <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
            <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                Clique no botão abaixo para verificar sua conta em nosso website!
            </p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <a href="#" style="background: linear-gradient(to right, #6A11CB, #2575FC); color: white; padding: 10px 30px; text-decoration: none; border-radius: 10px; font-size: 16px;">
                    Verificar
                </a>
            </div>
        </div>
    </div>
                `
          });

            return tryToSendEmailForTheUser;;
        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};