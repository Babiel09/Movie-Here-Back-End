import { Injectable } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";

@Injectable()
export class UserLoginDto {
  @IsEmail(undefined,{message:"The email needs to follow this design: youremail@yourprovider.com"})
  email:string;

  @IsString({message:"The password myst be a string!"})
  password:string;
};