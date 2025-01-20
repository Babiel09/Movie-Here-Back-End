import { Injectable } from '@nestjs/common';
import { IsNumber } from 'class-validator';

@Injectable()
export class VoteMovieDTO{
  @IsNumber(undefined,{message:"The vote needs to be a number!"})
  vote:number;
};