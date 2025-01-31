import { Body, Controller, Get, Logger, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { MovieService } from "./movie.service";
import { Response } from "express";
import { RateMovieDTO } from './DTO/movie.rate.dto';

@Controller("movie")
export class MovieController{
    private readonly logger = new Logger(MovieController.name);
    constructor(private readonly movieService:MovieService){};

    @Get("/v1/test")
    private async testAPI(@Res()res:Response):Promise<Response>{
        try{
            const resultTest = await this.movieService.movieAPITest();
            return res.status(200).send(resultTest.data);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/films")
    private async getAllMoivesSince1900(@Res()res:Response,@Query("page")page:number):Promise<Response>{
        try{
            const allMovies = await this.movieService.getAllMovies(Number(page));
            return res.status(200).send(allMovies);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };



    @Get("/v1/findMovie/:id")
    private async findSpecifiedMovie(@Res()res:Response,@Param("id")id:number):Promise<Response>{
        try{
            const specifiedMovie = await this.movieService.getMovieForId(Number(id));

            return res.status(200).send(specifiedMovie);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/genders")
    private async showAllGenders(@Res()res:Response):Promise<Response>{
        try{
            const allGenders = await this.movieService.allGenders();

            return res.status(200).send(allGenders);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/image")
    private async showTheImages(@Res()res:Response,@Query("imageURL")imageURL:string):Promise<Response>{
        try{ 
            let arrayBuffer = await this.movieService.findImage(imageURL);
            
            res.setHeader("Content-Type", "image/jpeg");

            const realImage = Buffer.from(arrayBuffer);

            res.status(200).send(realImage);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/movieId/:id")
    private async findMOvieImages(@Res()res:Response,@Param("id")id:number):Promise<Response>{
        try{
            const allMovieImages = await this.movieService.findMovieImage(Number(id));
            
            return res.status(200).send(allMovieImages);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/companyImage/:id")
    private async findCompanyImage(@Res()res:Response,@Param("id")id:number):Promise<Response>{
        try{
            const companyImage = await this.movieService.getCompanyLogos(Number(id));
            return res.status(200).send(companyImage);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/actor")
    private async findUserByFullName(@Query("fullName")fullName:string, @Query("page")page:number, @Res()res:Response):Promise<Response>{
        try{
            if(!fullName){
                this.logger.error(`Insert the full name to do a search!`);
                return res.status(400).json({server:"Insert the full name to do a search!"});
            };

            const actorFinded = await this.movieService.searchForActor(fullName,page);

            return res.status(200).send(actorFinded); 

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/actor/photos/:id")
    private async findUserPhotos(@Param("id")id:number,@Res()res:Response):Promise<Response>{
        try{
            const userPhotos = await this.movieService.getActorImages(id);

            return res.status(200).send(userPhotos);

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Post("/v1/rateMovie")
    private async rateMovie(@Res()res:Response,@Body()data:RateMovieDTO):Promise<Response>{
        try{
            if(!data){
                this.logger.error(`You need to put all the data elements in the body to continue!`);
                return res.status(400).json({server:"You need to put all the data elements in the body to continue!"});
            };

            if(data.vote > 10){
              this.logger.error("Your vote can have a maximum value of 10");
              return res.status(400).json({server:"Your vote can have a maximum value of 10"});
            };

            const ratemovie = await this.movieService.rateMovieInDb(data);

            return res.status(200).send(ratemovie);

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };
    };

    @Get("/v1/orderByVotes")
    private async getMoviesCountVote(@Query("page")page:number,@Res()res:Response):Promise<Response>{
        try{
            const moviesPerVote = await this.movieService.findMoviesPerVote(Number(page));

            return res.status(200).send({totalPages:moviesPerVote.totalPages,currentPage:moviesPerVote.currentPage,movies:moviesPerVote.findMovieForTheMoreVotes});

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(err.status).json({server:`${err.message}`});
        };

    };
};