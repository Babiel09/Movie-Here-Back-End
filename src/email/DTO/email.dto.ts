import { Injectable } from "@nestjs/common";
import { IsEmail, IsString } from "class-validator";

@Injectable()
export class SendEmail{
    @IsEmail(undefined,{message:"Please input a valid email"})
    to:string;
    @IsEmail(undefined,{message:"Please input a valid email"})
    from:string;
    @IsString({message:"The subject needs to be a string!"})
    subject:string;
    @IsString({message:"The text needs to be a string!"})
    text:string;
    @IsString({message:"The html needs to input like a string"})
    html:HTMLBodyElement

};