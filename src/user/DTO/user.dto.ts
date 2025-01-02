import { Injectable } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";

@Injectable()
export class CreationUser{
    @IsString({message:"The name needs to be a string"})
    name:string;

    @IsEmail(undefined,{message:"The email needs to follow this design: youremail@yourprovider.com"})
    email:string;

    @MinLength(8,{message:"The password needs to have 8 caractheres!"})
    password:string;

    
};