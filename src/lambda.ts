import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';
import { Context } from 'aws-lambda';

const bootstrap = (async () => {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.use(eventContext());
  await app.init();

  process.on('SIGINT', () => {
    app.close();
  });

  return createServer(expressApp, undefined, []);
})();

export async function handler(event: any, context: Context) {
  const server = await bootstrap;
  return proxy(server, event, context, 'PROMISE').promise;
}
