import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { EMAIL_QUEUE } from "src/constants/constants";
import { Queue } from "bull";
import { PrismaService } from "prisma/prisma.service";
import { Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

@Injectable()
export class EmailService{
    private readonly logger = new Logger(EmailService.name);
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(private readonly mailerService:MailerService,@InjectQueue(EMAIL_QUEUE)private readonly emailQueue:Queue,private readonly pr:PrismaService){
        this.prisma = pr.user;
    };

    public async sendEmail(email:string):Promise<EmailService>{

        try{
            const tryToSendEmail = await this.mailerService.sendMail({
                to:email,
                from:process.env.GMAIL_USER,
                subject:"Account verified",
                text:"Your Account is now verified, you can come back to our website!",
                html:`

       <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">Your Account is now verified, you can come back to our website!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Back to Website</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>
        </div>
    </div>
                `
            });

            this.logger.debug("Working in a new job in the Email Queue");
            
            const emailJob = await this.emailQueue.add(EMAIL_QUEUE,{
               jobTo:email,
               jobFrom:process.env.GMAIL_USER,
               jobSubject:"Account verified",
               jobText:"Your Account is now verified, you can come back to our website!",
               jobHtml:`
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">Your Account is now verified, you can come back to our website!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Back to Website</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
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
                subject:"Verify your account",
                text:"Click in the button behold to verify your account in our website!",
                html:`

       <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">Click in the button behold to verify your account in our website!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Verify</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>
        </div>
    </div>
                `
          });

          
          this.logger.debug("Working in a new job in the Email Queue");
            
          const emailJobVerify = await this.emailQueue.add(EMAIL_QUEUE,{
             jobTo:userEmail,
             jobFrom:process.env.GMAIL_USER,
             jobSubject:"Verify your account",
             jobText:"Click in the button behold to verify your account in our website!",
             jobHtml:`
       <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                   <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">Click in the button behold to verify your account in our website!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Verify</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>
        </div>
    </div>
             `
          });

          this.logger.debug(`Processed job: ${JSON.stringify(emailJobVerify.data)}`);

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

         <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">Click in the button behold to change your password in our website!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Change Password</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>
        </div>
    </div>
                    `
            });

                
          this.logger.debug("Working in a new job in the Email Queue");
            
          const emailJobPassword = await this.emailQueue.add(EMAIL_QUEUE,{
             jobTo:userEmail,
             jobFrom:process.env.GMAIL_USER,
             jobSubject:"Change Password",
             jobText:"Click in the button behold to change your password in our website!",
             jobHtml:`
    
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">Click in the button behold to change your password in our website!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Change Password</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>
        </div>
    </div>
             `
          });

          this.logger.debug(`Processed job: ${JSON.stringify(emailJobPassword.data)}`);

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
                subject:"Rescue your password",
                text:"If you wanna rescue your password click in the button below!",
                html:`

       <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
        </div>
    
        <!-- Main Content -->
        <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
            <div style="margin-top: 30px;">
                <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">If you wanna rescue your password click in the button below!</h3>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Rescue Password</a>
                </div>
            </div>
        </div>
    
        <!-- Footer -->
        <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
            <p style="color: #888888; margin: 0; font-size: 14px;">
                © 2025 Movie Here. Todos os direitos reservados.
            </p>
            <div style="margin-top: 15px;">
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
                <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>
        </div>
    </div>
                `
        });

        this.logger.debug("Working in a new job in the Email Queue");
            
        const emailJobRecoverPassword = await this.emailQueue.add(EMAIL_QUEUE,{
           jobTo:userEmail,
           jobFrom:process.env.GMAIL_USER,
           jobSubject:"Rescue your password",
           jobText:"If you wanna rescue your password click in the button below!",
           jobHtml:`

  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #1a1a1a, #000000); color: #ffffff; font-family: Arial, sans-serif;">
   <!-- Header -->
   <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
       <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
   </div>

   <!-- Main Content -->
   <div style="padding: 30px 20px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; margin-bottom: 20px;">
       <div style="margin-top: 30px;">
           <div style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 31, 31, 0.5); padding: 25px; margin-bottom: 25px; border-radius: 8px;">
               <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 0;">If you wanna rescue your password click in the button below!</h3>
           </div>
           
           <div style="text-align: center; margin: 35px 0;">
               <a href="#" style="background-color: #ef4444; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Rescue Password</a>
           </div>
       </div>
   </div>

   <!-- Footer -->
   <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
       <p style="color: #888888; margin: 0; font-size: 14px;">
           © 2025 Movie Here. Todos os direitos reservados.
       </p>
       <div style="margin-top: 15px;">
           <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Contact</a>
           <a href="#" style="color: #ef4444; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
       </div>
   </div>
</div>
           `
        });

        this.logger.debug(`Processed job: ${JSON.stringify(emailJobRecoverPassword.data)}`);

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


            const digitisTOTheDB = await this.prisma.update({
                where:{
                    email:userEmail
                },
                data:{
                    digits:realDigits
                }
            });

            this.logger.debug(digitisTOTheDB);

            const tryToSendEmailWithDigitis  = await this.mailerService.sendMail({
                to:userEmail,
                from:process.env.GMAIL_USER,
                subject:"Do Login",
                text:"Login code!",
                html:`

     <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1a1a1a, #000000); padding: 20px; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
    </div>
    
    <!-- Main Content -->
    <div style="margin: 20px; padding: 30px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; text-align: center;">
        <p style="font-size: 24px; color: #ffffff; margin-bottom: 25px; font-family: Arial, sans-serif;">
            Here is your login code:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <h2 style="background-color: #ef4444; color: #ffffff; padding: 20px 40px; display: inline-block; border-radius: 9999px; font-size: 32px; margin: 0; font-weight: bold;">
                ${realDigits}
            </h2>
        </div>
    </div>

    <!-- Footer -->
    <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
        <p style="color: #888888; margin: 0; font-size: 14px;">
            © 2025 Movie Here. All rights reserved.
        </p>
    </div>
</div>
                `
        });

        this.logger.debug("Working in a new job in the Email Queue");
            
        const emailJobTwoStepsVerification = await this.emailQueue.add(EMAIL_QUEUE,{
           jobTo:userEmail,
           jobFrom:process.env.GMAIL_USER,
           jobSubject:"Do Login",
           jobText:"Login code!",
           jobHtml:`

<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1a1a1a, #000000); padding: 20px; font-family: Arial, sans-serif;">
<!-- Header -->
<div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
   <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
</div>

<!-- Main Content -->
<div style="margin: 20px; padding: 30px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; text-align: center;">
   <p style="font-size: 24px; color: #ffffff; margin-bottom: 25px; font-family: Arial, sans-serif;">
       Here is your login code:
   </p>
   
   <div style="text-align: center; margin: 30px 0;">
       <h2 style="background-color: #ef4444; color: #ffffff; padding: 20px 40px; display: inline-block; border-radius: 9999px; font-size: 32px; margin: 0; font-weight: bold;">
           ${realDigits}
       </h2>
   </div>
</div>

<!-- Footer -->
<div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
   <p style="color: #888888; margin: 0; font-size: 14px;">
       © 2025 Movie Here. All rights reserved.
   </p>
</div>
</div>
           `
        });

        this.logger.debug(`Processed job: ${JSON.stringify(emailJobTwoStepsVerification.data)}`);

        return tryToSendEmailWithDigitis;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };

    public async confirmVerify(userEmail:string):Promise<MailerService>{
        try{
            
            const wthOutDigitis:number[] = [];

            const digitisTOTheDB = await this.prisma.update({
                where:{
                    email:userEmail
                },
                data:{
                    digits:wthOutDigitis
                }
            });

            console.log(digitisTOTheDB);

            const tryToSendEmailWithConfirm  = await this.mailerService.sendMail({
                to:userEmail,
                from:process.env.GMAIL_USER,
                subject:"Login",
                text:"Login confirmed!",
                html:`

    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1a1a1a, #000000); padding: 20px; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
    </div>
    
    <!-- Main Content -->
    <div style="margin: 20px; padding: 30px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; text-align: center;">
        <p style="font-size: 24px; color: #ffffff; margin-bottom: 25px; font-family: Arial, sans-serif;">
            Login Confirmed!
        </p>
    </div>

    <!-- Footer -->
    <div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
        <p style="color: #888888; margin: 0; font-size: 14px;">
            © 2025 Movie Here. All rights reserved.
        </p>
    </div>
</div>
                `
        });

        this.logger.debug("Working in a new job in the Email Queue");
            
        const emailJobTwoStepsVerificationCode = await this.emailQueue.add(EMAIL_QUEUE,{
           jobTo:userEmail,
           jobFrom:process.env.GMAIL_USER,
           jobSubject:"Login",
           jobText:"Login confirmed!",
           jobHtml:`

<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1a1a1a, #000000); padding: 20px; font-family: Arial, sans-serif;">
<!-- Header -->
<div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
   <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Movie Here</h1>
</div>

<!-- Main Content -->
<div style="margin: 20px; padding: 30px; background: rgba(31, 31, 31, 0.3); border-radius: 12px; text-align: center;">
   <p style="font-size: 24px; color: #ffffff; margin-bottom: 25px; font-family: Arial, sans-serif;">
       Login Confirmed!
   </p>
</div>

<!-- Footer -->
<div style="background: rgba(31, 31, 31, 0.5); padding: 25px; text-align: center; border-radius: 12px;">
   <p style="color: #888888; margin: 0; font-size: 14px;">
       © 2025 Movie Here. All rights reserved.
   </p>
</div>
</div>
           `
        });

        this.logger.debug(`Processed job: ${JSON.stringify(emailJobTwoStepsVerificationCode.data)}`);

        return tryToSendEmailWithConfirm;

        }catch(err){
            this.logger.error(`${err.message}`);
            throw new HttpException(`${err.message}`,err.status);
        };
    };
};