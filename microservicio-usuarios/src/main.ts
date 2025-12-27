import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Transport} from '@nestjs/microservices'


dotenv.config();
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001, // Puerto para este microservicio
    }
  });
  // await app.listen(process.env.PORT ?? 3000);
  await app.listen();
}
bootstrap();
