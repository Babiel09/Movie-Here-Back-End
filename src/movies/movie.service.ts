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
};