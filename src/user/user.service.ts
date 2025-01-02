import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class UserService{
    private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
    constructor(private readonly pr:PrismaService){
        this.prisma = pr.user;
    };
};