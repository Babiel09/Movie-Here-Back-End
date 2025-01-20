import { Injectable } from '@nestjs/common';
import { IsInt, IsNumber } from 'class-validator';

@Injectable()
export class VoteMovieDTO{

  @IsNumber(undefined,{message:"The movie id needs to be a number!"})
  @IsInt({message:"The movie id needs to be a int value!"})
  movieId:number;

  @IsNumber(undefined,{message:"The user id needs to be a number!"})
  @IsInt({message:"The user id needs to be a int value!"})
  userId:number;

  @IsNumber(undefined,{message:"The vote needs to be a number!"})
  vote:number;
};