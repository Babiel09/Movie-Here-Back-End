import { Module } from '@nestjs/common';
import { PismaModule } from 'prisma/prisma.module';


@Module({
  imports: [PismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {};
