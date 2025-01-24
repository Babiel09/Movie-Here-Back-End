import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Comments, Movies, Prisma, Roles, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import { CreationUser } from './DTO/user.dto';
import { InjectQueue } from '@nestjs/bull';
import { USER_QUEUE } from 'src/constants/constants';
import { Queue } from 'bull';
import * as bcrypt from 'bcrypt';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Axios, AxiosError } from 'axios';
import { UserLoginDto } from './DTO/user.login.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserCreateCommnetDto } from './DTO/user.createCommnet.dto';
import { UserCreateDescriptionDto } from './DTO/user.createDescription.dto';

@Injectable()
export class UserService {
  private readonly prisma: Prisma.UserDelegate<DefaultArgs>;
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly pr: PrismaService,
    @InjectQueue(USER_QUEUE) private readonly userQueue: Queue,
    private readonly httpService: HttpService,
  ) {
    this.prisma = pr.user;
  }

  private async validateInstace(instance: object) {
    const realDataError = await validate(instance);

    if (realDataError.length > 0) {
      this.logger.error('Validation failed!');
      throw new HttpException(
        `${realDataError.map((err) => Object.values(err.constraints)).join(', ')}`,
        400,
      );
    }
  }

  public async InsertUser(data: CreationUser): Promise<User> {
    try {
      const verifyEmail = await this.prisma.findUnique({
        where: {
          email: data.email,
        },
      });

      if (verifyEmail) {
        this.logger.error(`Email(${data.email} is already in your DB!)`);
        throw new HttpException(
          `Email(${data.email} is already in your DB!)`,
          400,
        );
      }

      const tryToCreate = await this.prisma.create({
        data: data,
      });

      return tryToCreate;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async SelectAll(): Promise<User[]> {
    try {
      const tryToGetAllUsers = await this.prisma.findMany();

      return tryToGetAllUsers;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async SelectOne(id: number): Promise<User> {
    try {
      const tryToFindUser = await this.prisma.findUnique({
        where: {
          id: id,
        },
      });

      return tryToFindUser;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async Login(data: UserLoginDto): Promise<User> {
    const realEmail = plainToInstance(UserLoginDto, data);

    await this.validateInstace(realEmail);

    try {
      const searchUserEmail = this.prisma.findUnique({
        where: {
          email: data.email,
        },
      });

      this.logger.debug('Working in a new job in the User Queue');
      const loginJob = await this.userQueue.add(USER_QUEUE, {
        jobId: (await searchUserEmail).id,
        jobName: `Login Job${(await searchUserEmail).id}`,
      });
      this.logger.debug(`Processed job: ${JSON.stringify(loginJob.data)}`);

      return searchUserEmail;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  private async findMovie(movieId: number): Promise<Movies> {
    try {
      const tryToFindMovie = await this.pr.movies.findUnique({
        where: {
          realId: movieId,
        },
      });

      return tryToFindMovie;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async CreateAComment(
    movieId: number,
    userId: number,
    userComment: UserCreateCommnetDto,
  ): Promise<Comments> {
    const realComment = plainToInstance(UserCreateCommnetDto, userComment);

    const realDataError = await validate(realComment);

    if (realDataError.length > 0) {
      this.logger.error('Validation failed!');
      throw new HttpException(
        `${realDataError.map((err) => Object.values(err.constraints)).join(', ')}`,
        400,
      );
    }

    try {
      const movie = await this.findMovie(Number(movieId));

      const newComment = await this.pr.comments.create({
        data: {
          comment: realComment.userComment,
          userId: userId,
          movieId: movie.id,
        },
      });

      return newComment;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async CreateDescription(
    id: number,
    description: UserCreateDescriptionDto,
  ): Promise<User> {
    const realDescription = plainToInstance(
      UserCreateDescriptionDto,
      description,
    );

    await this.validateInstace(realDescription);

    try {
      const tryToUpdate = await this.prisma.update({
        where: {
          id: id,
        },
        data: {
          description: realDescription.description,
        },
      });

      return tryToUpdate;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async ChangeUserRole(newRole: Roles, id: number): Promise<User> {
    try {
      const findUser = await this.SelectOne(Number(id));

      const tryToChangeTheRole = await this.prisma.update({
        where: {
          id: Number(findUser.id),
        },
        data: {
          role: newRole,
        },
      });

      return tryToChangeTheRole;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async DeleteUser(id: number): Promise<User> {
    try {
      const findUserByid = await this.SelectOne(Number(id));

      const deleteUser = await this.prisma.delete({
        where: {
          id: findUserByid.id,
        },
      });

      return deleteUser;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }

  public async FingThePhotoInWeb(photo: string): Promise<ArrayBuffer> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<ArrayBuffer>(photo, { responseType: 'arraybuffer' })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`${error}`);
            throw new HttpException(`${error.message}`, error.status);
          }),
        ),
    );
    return data;
  }

  public async InsertuserWIthGoogle(data: {
    name: string;
    email: string;
    photo: Uint8Array;
  }): Promise<User> {
    try {
      const verifyEmail = await this.prisma.findUnique({
        where: {
          email: data.email,
        },
      });

      if (verifyEmail) {
        this.logger.error(`Email(${data.email} is already in your DB!)`);
        throw new HttpException(
          `Email(${data.email} is already in your DB!)`,
          400,
        );
      }

      const newUserWithGoogle = this.prisma.create({
        data: {
          name: data.name,
          password: '',
          email: data.email,
          photo: data.photo,
        },
      });

      return newUserWithGoogle;
    } catch (err) {
      this.logger.error(`${err.message}`);
      throw new HttpException(`${err.message}`, err.status);
    }
  }
}
