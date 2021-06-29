import { Airport } from '.prisma/client';
import { Controller, Get } from '@nestjs/common';
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

  @Get('/api/tickets')
  async getTicket(): Promise<Airport[]> {
    return this.prisma.airport.findMany({
      where: {
        name: {
          startsWith: 'haha',
        },
      },
    });
  }
}

export { AppController };
