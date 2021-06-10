import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  process.on('SIGINT', () => {
    app.close();
  });
}
bootstrap();
