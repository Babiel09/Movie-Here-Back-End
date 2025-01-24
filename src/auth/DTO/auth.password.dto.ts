import { Injectable } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';

@Injectable()
export class AuthPasswordDto{
  @IsString({message:"The new password must be a string!"})
  @MinLength(8,{message:"The new password must have 8 characters!"})
  newPassword:string;
};