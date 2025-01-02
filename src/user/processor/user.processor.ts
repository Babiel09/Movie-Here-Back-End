import { Processor } from "@nestjs/bull";
import { USER_QUEUE } from "src/constants/constants";
import { UserService } from "../user.service";

@Processor(USER_QUEUE)
export class UserProcessor{
    constructor(private readonly userService:UserService){};
};