import { Injectable } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';

@Injectable()
export class UserCreateDescriptionDto {
  @IsString({message:"The user description must be a string!"})
  @MaxLength(610,{message:"The description can have in the max 610 characters!"})
  description:string;
};