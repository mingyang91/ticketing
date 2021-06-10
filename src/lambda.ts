import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express'
import { AppModule } from './app.module';
import * as express from 'express'
import { Context } from 'aws-lambda'

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.use(eventContext());
  await app.init();
  return createServer(expressApp, undefined, []);
}

const serverM = bootstrap();

export async function handler(event: any, context: Context) {
  const server = await serverM
  return proxy(server, event, context, 'PROMISE').promise
}