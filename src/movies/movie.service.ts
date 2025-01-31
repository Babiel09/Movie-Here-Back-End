import { HttpService } from "@nestjs/axios";
import { InjectQueue } from "@nestjs/bull";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Movies, Prisma, UpVotes } from '@prisma/client';
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Axios, AxiosError } from "axios";
import { PrismaService } from "prisma/prisma.service";
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { MOVIE_QUEUE } from "src/constants/constants";
import { RateMovieDTO } from './DTO/movie.rate.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class MovieService{
    private readonly logger = new Logger(MovieService.name);
    private readonly prisma: Prisma.MoviesDelegate<DefaultArgs>;
    constructor(
      private readonly httpService:HttpService,
      @InjectQueue(MOVIE_QUEUE) private readonly movieQueue,
      private readonly rateMovieDto:RateMovieDTO,
      private readonly pr:PrismaService,
    ){
      this.prisma = pr.movies;
    };

    private async findImage(imageUrl:string):Promise<Axios>{
      const {data} = await firstValueFrom(
        this.httpService.get<any>(`http://52.33.176.184/tmdbbd/${imageUrl}`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`${error}`);
            throw new HttpException(`${error.message}`,error.status);
          }),
        ),
      );

      return data;
    };

    private async searchMovieIdInDB(id:number):Promise<Movies | null>{
      try{
        const tryToFindMovie = await this.prisma.findUnique({
          where:{
            realId:id,
          }
        });

        return tryToFindMovie;
      } catch(error){
        this.logger.error(`${error}`);
        throw new HttpException(`${error.message}`,error.status);
      };
    };

    private async injectMovieInDB(id:number):Promise<Movies>{
      try{

        const findMovie = await this.searchMovieIdInDB(id);

        if(findMovie){
          return findMovie;
        };

        const newMovie = await this.prisma.create({
          data:{
            realId:Number(id),
            avarage:undefined,
          }
        });

        return newMovie;

      } catch(error){
        this.logger.error(`${error}`);
        throw new HttpException(`${error.message}`,error.status);
      };
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

    public async getAllMovies(page:number):Promise<Axios[]>{

        const { data } = await firstValueFrom(
            this.httpService
              .get<any[]>(`https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc`, {
                headers: {
                  accept: 'application/json',
                  Authorization:
                   `Bearer ${process.env.TMDB_TOKEN}`,
                },
              })
              .pipe(
                catchError((error: AxiosError) => {
                  this.logger.error(`${error}`);
                  throw new HttpException(`${error.message}`,error.status);
                }),
              ),
          );

          this.logger.debug(`Working in a new job in the Movie Queue`);
          const jobMovies = await this.movieQueue.add(MOVIE_QUEUE,{
            jobPage:page
          });

          this.logger.debug(`Processed job: ${JSON.stringify(jobMovies.data)}`);

          return data;
    };

    public async allGenders():Promise<Axios>{
      const {data} = await firstValueFrom(
        this.httpService.get<any>("https://api.themoviedb.org/3/genre/movie/list?language=en",{
          headers:{
            accept:"application/json",
            Authorization:`Bearer ${process.env.TMDB_TOKEN}`
          }
        })
        .pipe(
          catchError((error:AxiosError)=>{
            this.logger.error(`${error}`);
            throw new HttpException(`${error.message}`,error.status);
          }),
        ),
      );

      return data;
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
          throw new HttpException(`${error.message}`,error.status);
        }),
      ),
     );

     this.logger.debug("Working in a new job in the Movie Queue");
     const specifiedMovieJob = await this.movieQueue.add(MOVIE_QUEUE,{
       jobId:id
     });
     this.logger.debug(`Processed job: ${JSON.stringify(specifiedMovieJob.data)}`);

       const addedNewMovieINDB = await this.injectMovieInDB(id);
       this.logger.debug(addedNewMovieINDB.realId);

    return data;
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
          throw new HttpException(`${error.message}`,error.status);
        })),
      );

      this.logger.debug("Working in a new job in the Movie Queue");
      const companyImageJob = await this.movieQueue.add(MOVIE_QUEUE,{
        jobId:id
      });
      this.logger.debug(`Processed job: ${JSON.stringify(companyImageJob.data)}`);

      return data;
    };


    public async searchForActor(fullName:string, page:number):Promise<Axios[]>{

      const {data} = await firstValueFrom(
        this.httpService.get<any[]>(`https://api.themoviedb.org/3/search/person?query=${fullName}&include_adult=false&language=en-US&page=${Number(page)}`,{
          headers:{
            accept:"application/json",
            Authorization:`Bearer ${process.env.TMDB_TOKEN}`,
          },
        })
        .pipe(catchError((error:AxiosError)=>{
          this.logger.error(`${error}`);
          throw new HttpException(`${error.message}`,error.status);
        })),
      );


      this.logger.debug("Working in a new job in the Movie Queue");
      const ActorJob = await this.movieQueue.add(MOVIE_QUEUE,{
        jobName:fullName,
        jobPage:page,
      });
      this.logger.debug(`Processed job: ${JSON.stringify(ActorJob.data)}`);


      return data;
    };

    public async getActorImages(id:number):Promise<Axios[]>{
      const {data} = await firstValueFrom(
        this.httpService.get<any[]>(`https://api.themoviedb.org/3/person/${id}/images`,{
          headers:{
            accept:"application/json",
            Authorization:`Bearer ${process.env.TMDB_TOKEN}`,
          },
        })
        .pipe(
          catchError((error:AxiosError)=>{
            this.logger.error(`${error}`);
            throw new HttpException(`${error.message}`,error.status);
          })
        ),
      );

      this.logger.debug("Working in a new job in the Movie Queue");
      const ActorImageJob = await this.movieQueue.add(MOVIE_QUEUE, {
        jobId: id,
      });
      this.logger.debug(`Processed job: ${JSON.stringify(ActorImageJob.data)}`);

      return data;
    };

    public async rateMovieInDb(data:RateMovieDTO):Promise<UpVotes>{
      try{
          const realData = plainToInstance(RateMovieDTO,data);

          const realDataError = await validate(realData);

          if(realDataError.length > 0){
            this.logger.error("Error to validate the data!");
            throw new HttpException(`${realDataError.map(err => Object.values(err.constraints)).join(', ')}`,400);
          };

          const findMovie = await  this.searchMovieIdInDB(realData.movieId);

          const newVote = await this.pr.upVotes.create({
            data:{
              userId:realData.userId,
              movieId:findMovie.realId,
              vote:realData.vote,
            },
          });
          
          return newVote;

      } catch (err){
        this.logger.error(`${err.message}`);
        throw new HttpException(`${err.message}`,err.status);
      };

      };

    public async findMoviesPerVote(page:number){
      const pageSize:number = 10;
      let currentPage:number = page;
       try{
         const findMovieForTheMoreVotes = await this.prisma.findMany({
           orderBy:{
             votes:{
               _count:'desc' // Ordena pela contagem de votos, decrescente
             }
           },
           include:{
             votes:true,
           },
           skip:(page - 1 ) * pageSize,
           take:pageSize
         });

         const totalMovies:number = await this.prisma.count();
         const totalPages:number = Math.ceil(totalMovies / pageSize);

         return {
           findMovieForTheMoreVotes,
           currentPage,
           totalPages
         };
       } catch (err){
        this.logger.error(`${err.message}`);
        throw new HttpException(`${err.message}`,err.status);
      };
    };

};