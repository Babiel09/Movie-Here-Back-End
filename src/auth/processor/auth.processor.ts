import { Process, Processor } from "@nestjs/bull";
import { AUTH_QUEUE } from "src/constants/constants";
import { AuthController } from "../auth.controller";
import { Job } from "bull";

@Processor(AUTH_QUEUE)
export class AuthProcessor{
    constructor(private readonly authController:AuthController){};

    @Process("docode")
    private async decoedProcessToken(job:Job){
        await this.authController.decodeToken(job.data);
    };

    @Process("token")
    private async showOAuthGoogleTokne(job:Job){
        await this.authController.googleCalback(job.data.res,job.data.req);
    };
};