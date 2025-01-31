import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      transform:false,
      forbidNonWhitelisted:true
    })
  );

  const port = process.env.PORT ?? 6785;

  await app.listen(port);

  logger.warn(`API i srunning in http://localhost:${port}`);
}
bootstrap();
