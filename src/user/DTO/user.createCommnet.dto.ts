import { Injectable } from "@nestjs/common";
import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

@Injectable()
export class UserCreateCommnetDto {
  @IsString({message:"The user comment must have to be a string!"})
  @MinLength(20,{message:"The comment must be at least 20 characters"})
  userComment:string;
};