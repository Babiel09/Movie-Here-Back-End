import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MovieService{
    constructor(private readonly httpService:HttpService){};
    
    public async movieAPITest(){
        const headers = {
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        };

        return lastValueFrom(
            this.httpService.get("https://api.themoviedb.org/3/authentication",{
                headers
            })
        );
    };

    public async getAllMovies(){
        const headers = {
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        };

        return lastValueFrom(
            this.httpService.get("https://api.themoviedb.org/3/movie/changes?end_date=2025-01-01&page=1&start_date=1900-01-01",{
                headers
            })
        );
    };
};