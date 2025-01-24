import { Injectable } from '@nestjs/common';
import { IsInt, IsNumber } from 'class-validator';

@Injectable()
export class RateMovieDTO{

  @IsInt({message:"The movie id must be a int value!"})
  movieId:number;

  @IsInt({message:"The userId must be a int value!"})
  userId:number;

  @IsNumber(undefined,{message:"The vote must be a float number!"})
  vote:number;
};