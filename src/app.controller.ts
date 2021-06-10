import { Airport } from '.prisma/client';
import { Controller, Get, Query } from '@nestjs/common';
import { OrderState } from '@prisma/client';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

type FreeTicket = {
  id: string;
  flightId: string;
  price: number;
  orderState: typeof OrderState.FREE;
};

type LockedTicket = {
  id: string;
  flightId: string;
  travelerId: string;
  price: number;
  orderState: typeof OrderState.LOCKED_WAIT_CONFIRM;
};

type PayingTicket = {
  id: string;
  flightId: string;
  travelerId: string;
  price: number;
  orderState: typeof OrderState.PAYING;
};

type PayedTicket = {
  id: string;
  flightId: string;
  travelerId: string;
  price: number;
  orderState: typeof OrderState.PAYED;
};

type TicketType = FreeTicket | LockedTicket | PayingTicket | PayedTicket;

type CreateTicketSuccess = {
  ticketId: string;
};

type CreateTicketError = {
  message: string;
};

type CreateTicketReply = CreateTicketSuccess | CreateTicketError;

type CreateOrderRawQueryResult = {
  id: string;
};

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

  @Get('/api/create-ticket-order')
  async createTicketOrder(
    @Query('uid') uid: string,
    @Query('flight') flight: string,
  ): Promise<CreateTicketReply> {
    const list: CreateOrderRawQueryResult[] = await this.prisma.$queryRaw`
      UPDATE "Ticket"
      SET "orderState" = ${OrderState.LOCKED_WAIT_CONFIRM},
          "travelerId" = ${uid}
      WHERE id in (
        SELECT id 
        FROM "Ticket"
        WHERE "orderState" = ${OrderState.FREE}
          AND "flightId" = ${flight}
        LIMIT 1
      )
      RETURNING id
    `;

    if (list[0]) {
      return {
        ticketId: list[0].id,
      };
    } else {
      return {
        message: 'The flight is sold out!',
      };
    }
  }
}

export { AppController };
