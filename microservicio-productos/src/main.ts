import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {port: 3003},
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Eliminar propiedades no definidas en los DTO
    forbidNonWhitelisted: true, // Rechazar requests con propiedades extras
    transform: true,
  }));
  await app.listen();
}
bootstrap();
