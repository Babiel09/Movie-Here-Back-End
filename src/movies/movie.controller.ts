import { Controller, Get, Logger, Res, UseGuards } from "@nestjs/common";
import { MovieService } from "./movie.service";
import { Response } from "express";

@Controller("movie")
export class MovieController{
    private readonly logger = new Logger(MovieController.name);
    constructor(private readonly movieService:MovieService){};

    @Get("/v1/test")
    private async testAPI(@Res()res:Response) {
        try{
            const resultTest = await this.movieService.movieAPITest();
            return res.status(200).send(resultTest.data);
        }catch(err){
            this.logger.error(`${err.message}`);
            return res.status(500).json({server:`${err.message}`});
        };
    };
};