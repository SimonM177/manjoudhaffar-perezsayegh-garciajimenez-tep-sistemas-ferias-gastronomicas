import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Transport} from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config';


dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: configService.get('HOST'),
      port: configService.get('PORT'),
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
