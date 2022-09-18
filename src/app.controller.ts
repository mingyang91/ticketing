import { Controller, Get } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { range } from 'ramda';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get('/api/fake-data-fill')
  async fill(): Promise<string> {
    const products = range(1, 100).map(() => {
      return {
        id: randomUUID(),
        quantity: 500,
      };
    });
    await this.prisma.product.createMany({
      data: products,
    });
    return 'ok';
  }
}

export { AppController };
