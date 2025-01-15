import { Injectable } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";

@Injectable()
export class CreatingGoogleUserPass{
    @IsString({message:"The password needs to be a string!"})
    @MinLength(8,{message:"The password needs to have minium 8 caractheres!"})
    password:string;
};