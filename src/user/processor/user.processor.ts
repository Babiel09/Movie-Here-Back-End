import { Process, Processor } from "@nestjs/bull";
import { USER_QUEUE } from "src/constants/constants";
import { UserService } from "../user.service";
import { Job } from "bull";

@Processor(USER_QUEUE)
export class UserProcessor{
    constructor(private readonly userService:UserService){};

    @Process("login")
    private async processLogin(job:Job){
        await this.userService.Login(job.data);
    };
};