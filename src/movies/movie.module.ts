import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MovieController } from "./movie.controller";
import { MovieService } from "./movie.service";
import { BullModule } from "@nestjs/bull";
import { MOVIE_QUEUE } from "src/constants/constants";
import { MovieProcessor } from "./processor/movies.processor";

@Module({
    imports:[
        HttpModule,
        BullModule.registerQueue({
            name:MOVIE_QUEUE
        }),
    ],
    controllers:[MovieController],
    providers:[MovieService,MovieProcessor]
})
export class MovieModule{};