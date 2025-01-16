import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { EMAIL_QUEUE } from "src/constants/constants";
import { Queue } from "bull";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class EmailService{
    private readonly logger = new Logger(EmailService.name);
    private readonly prisma;
    constructor(private readonly mailerService:MailerService,@InjectQueue(EMAIL_QUEUE)private readonly emailQueue:Queue,private readonly pr:PrismaService){
        this.prisma = pr.user;
    };

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

            return tryToSendEmailForTheUser;
        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

        public async sendEmailChangePassword(userEmail:string):Promise<MailerService>{
            try{
                const tryToSendEmailChangePassword  = await this.mailerService.sendMail({
                    to:userEmail,
                    from:process.env.GMAIL_USER,
                    subject:"Trocar Senha",
                    text:"Clique no botão abaixo para trocar sua senha em nosso website!",
                    html:`

          <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

            <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <h1>Movie Here</h1>
            </div>
                
            <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
                <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                    Clique no botão abaixo para trocar sua senha em nosso website!
                </p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="#" style="background: linear-gradient(to right, #6A11CB, #2575FC); color: white; padding: 10px 30px; text-decoration: none; border-radius: 10px; font-size: 16px;">
                        Trocar Senha
                    </a>
                </div>
            </div>
        </div>
                    `
            });

            return tryToSendEmailChangePassword;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async emailToConfirmUser(userEmail:string):Promise<MailerService>{
        try{
            const tryToSendEmailChangePassword  = await this.mailerService.sendMail({
                to:userEmail,
                from:process.env.GMAIL_USER,
                subject:"Recuperação de senha",
                text:"Recuperar senha da sua conta.",
                html:`

      <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

        <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Movie Here</h1>
        </div>
            
        <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
            <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                Por favor, caso queira recuperar sua senha, por favor acesse o link do botão abaixo.
            </p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <a href="#" style="background: linear-gradient(to right, #6A11CB, #2575FC); color: white; padding: 10px 30px; text-decoration: none; border-radius: 10px; font-size: 16px;">
                    Recuperar Senha
                </a>
            </div>
        </div>
    </div>
                `
        });

        return tryToSendEmailChangePassword;

    }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };


    public async veriFyUserInLogin(userEmail:string):Promise<MailerService>{
        try{

            let someCaracteres:string[] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9"];

            let realDigits:number[] = [];

            for(let i = 0; i < 4; i++){
                let digits:number = Math.floor(Math.random() * someCaracteres.length);
                realDigits.push(digits);
            };

            const digitisTOTheDB = await this.prisma.create({
                where:{
                    email:userEmail
                },
                data:{
                    digits:realDigits
                }
            });

            this.logger.debug(digitisTOTheDB);

            const tryToSendEmailChangePassword  = await this.mailerService.sendMail({
                to:userEmail,
                from:process.env.GMAIL_USER,
                subject:"Efetuar Login",
                text:"Código de login!",
                html:`

      <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

        <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Movie Here</h1>
        </div>
            
        <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
            <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                Aqui está o código de login:
            </p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <h2 style="background: linear-gradient(to right, #6A11CB, #2575FC); color: white; padding: 10px 30px; text-decoration: none; border-radius: 10px;">
                   ${realDigits}
                </h2>
            </div>
        </div>
    </div>
                `
        });

        return tryToSendEmailChangePassword;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async confirmVerify(userEmail:string):Promise<MailerService>{
        try{
            
            let wthOutDigitis:number[] = [0]

            const digitisTOTheDB = await this.prisma.update({
                where:{
                    email:userEmail
                },
                data:{
                    digits:wthOutDigitis
                }
            });

            console.log(digitisTOTheDB);

            const tryToSendEmailChangePassword  = await this.mailerService.sendMail({
                to:userEmail,
                from:process.env.GMAIL_USER,
                subject:"Efetuar Login",
                text:"Lógin confirmado!",
                html:`

      <div style="background: linear-gradient(to right, #AD8CEA, #50DFB2); padding: 10px;">

        <div style="background: linear-gradient(to right, #1A2980, #26DDCE); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Movie Here</h1>
        </div>
            
        <div style="margin: 20px; padding: 20px; border: 2px solid blue; border-radius: 10px; display: flex; justify-content: center;">
            <p style="font-size: 24px; color: white; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
                Login confirmado!
            </p>
            </div>
        </div>
    </div>
                `
        });

        return tryToSendEmailChangePassword;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};