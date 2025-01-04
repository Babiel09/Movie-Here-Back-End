import { HttpService } from "@nestjs/axios";
import { InjectQueue } from "@nestjs/bull";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Axios, AxiosError } from "axios";
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { MOVIE_QUEUE } from "src/constants/constants";

@Injectable()
export class MovieService{
    private page:number;
    private readonly logger = new Logger(MovieService.name);
    constructor(
      private readonly httpService:HttpService,
      @InjectQueue(MOVIE_QUEUE) private readonly movieQueue
    ){
      this.page = 1;
    };
    
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

    public async getAllMovies():Promise<Axios[]>{

        const { data } = await firstValueFrom(
            this.httpService
              .get<any[]>(`https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=en-US&page=${this.page}&sort_by=popularity.desc`, {
                headers: {
                  accept: 'application/json',
                  Authorization:
                   `Bearer ${process.env.TMDB_TOKEN}`,
                },
              })
              .pipe(
                catchError((error: AxiosError) => {
                  this.logger.error(`${error}`);
                  throw new HttpException(`${error}`,500);
                }),
              ),
          );

          this.logger.debug(`Working in a new job in the Movie Queue`);
          const jobMovies = await this.movieQueue.add(MOVIE_QUEUE,{
            jobName:`Movies Job`,
          });
          
          this.logger.debug(`Processed job: ${JSON.stringify(jobMovies.data)}`);

          return data;
    };

    public changePage(newPage:number){
      this.page = newPage;
    };

    public async getMovieForId(id:number):Promise<Axios>{
     const {data}  = await firstValueFrom(
      this.httpService.get<any>(`https://api.themoviedb.org/3/movie/${id}?language=en-US`,{
          headers:{
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          },
      })
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`${error}`);
          throw new HttpException(`${error}`,500);
        }),
      ),
     );
     return data
    };

    public async getCompanyLogos(id:number):Promise<Axios>{
      const {data} = await firstValueFrom(
        this.httpService.get<any>(`https://api.themoviedb.org/3/company/${id}/images`,{
          headers:{
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          },
        })
        .pipe(
          catchError((error:AxiosError)=>{
          this.logger.error(`${error}`);
          throw new HttpException(`${error}`,500);
        })),
      );

      this.logger.debug("Working in a new job in the Movie Queue");
      const companyImageJob = await this.movieQueue.add(MOVIE_QUEUE,{
        jobId:id
      });
      this.logger.debug(`Processed job: ${JSON.stringify(companyImageJob.data)}`);

      return data;
    };
};