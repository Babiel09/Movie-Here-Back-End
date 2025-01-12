import { JOB_REF, Process, Processor } from "@nestjs/bull";
import { MOVIE_QUEUE } from "src/constants/constants";
import { MovieService } from "../movie.service";
import { Job } from "bull";

@Processor(MOVIE_QUEUE)
export class MovieProcessor{
    constructor(private readonly movieService:MovieService){};
    
    @Process("all_movies")
    private async workerAllMovies(job: Job){
        await this.movieService.getAllMovies(job.data);
    };

    @Process("company_images")
    private async workerCompanyImg(job:Job){
      await this.movieService.getCompanyLogos(job.data);
    };
    
    @Process("search_actor")
    private async workerFindActor(job:Job){
        await this.movieService.searchForActor(job.data.name,job.data.page);
    };

    @Process("actor_images")
    private async workerActorImage(job:Job){
        await this.movieService.getActorImages(job.data);
    };

    @Process("get_specified_movie")
    private async workerGetSpecifiedMovie(job:Job){
        await this.movieService.getMovieForId(job.data)
    };
    
};