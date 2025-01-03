import { Controller, Get, Logger, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import { MovieService } from "./movie.service";
import { Response } from "express";

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
            return res.status(500).json({server:`${err.message}`});
        };
    };

    @Get("/v1/films")
    private async getAllMoivesSice1900(@Res()res:Response):Promise<Response>{
        try{
            const allMovies = await this.movieService.getAllMovies();
            return res.status(200).send(allMovies);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(500).json({server:`${err.message}`});
        };
    };

    @Put("/v1/changePage/:page")
    private async changeTheDefaultPage(@Param("page")page:number,@Res()res:Response):Promise<Response>{
        try{
            if(!page){
                this.logger.error("Please insert a valid page!");
                return res.status(400).json("Please insert a valid page!");
            };

            this.movieService.changePage(Number(page));

            return res.status(200).json({server:`New page sett: ${page}`});

        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(500).json({server:`${err.message}`});
        };
    };
};