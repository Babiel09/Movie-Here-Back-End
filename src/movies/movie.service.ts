import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosError } from "axios";
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class MovieService{
    
    constructor(private readonly httpService:HttpService){};
    
    public async movieAPITest(){
        const headers = {
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        };

        return await lastValueFrom(
            this.httpService.get("https://api.themoviedb.org/3/authentication",{
                headers
            })
        );
    };

    public async getAllMovies(){

        const { data } = await firstValueFrom(
            this.httpService
              .get<any[]>('https://api.themoviedb.org/3/movie/changes?page=1', {
                headers: {
                  accept: 'application/json',
                  Authorization:
                   `Bearer ${process.env.TMDB_TOKEN}`,
                },
              })
              .pipe(
                catchError((error: AxiosError) => {
                  console.log(error);
                  throw 'An error happened!';
                }),
              ),
          );
      
          return data;
    };
};