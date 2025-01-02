import { Controller } from "@nestjs/common";
import { UserService } from "src/user/user.service";

@Controller("auth")
export class AuthController{
    constructor(private readonly userService:UserService){};
};