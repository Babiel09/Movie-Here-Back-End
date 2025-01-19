import { Process, Processor } from "@nestjs/bull";
import { AUTH_QUEUE } from "src/constants/constants";
import { AuthController } from "../auth.controller";
import { Job } from "bull";
import { GoogleStrategy } from "../google/auth.google.strategy";
import { AuthService } from "../auth.service";

@Processor(AUTH_QUEUE)
export class AuthProcessor{
    constructor(private readonly authController:AuthController,private readonly googleStrategy:GoogleStrategy,private readonly authService:AuthService){};

    @Process("docode")
    private async decoedProcessToken(job:Job){
        await this.authController.decodeToken(job.data);
    };

    @Process("new_user")
    private async googleStrategyWorker(){
        await this.googleStrategy.validate();
    };

    @Process("new_password_google_aouth20")
    private async googleCreatePassword(job:Job){
        await this.authService.changeUserWithGooglePassword(job.data.id,job.data.newPassword);
    };
};