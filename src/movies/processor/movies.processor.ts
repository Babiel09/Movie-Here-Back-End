import { Process, Processor } from "@nestjs/bull";
import { MOVIE_QUEUE } from "src/constants/constants";
import { MovieService } from "../movie.service";
import { Job } from "bull";

@Processor(MOVIE_QUEUE)
export class MovieProcessor{
    constructor(private readonly movieService:MovieService){};
    
    @Process("all_movies")
    private async workerAllMovies(){
        await this.movieService.getAllMovies();
    };
};