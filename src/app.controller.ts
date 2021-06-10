import { Airport } from '.prisma/client';
import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { OrderState } from '@prisma/client';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { Response } from 'express';
import { SSL_OP_TLS_ROLLBACK_BUG } from 'constants';

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
    @Res({ passthrough: true }) res: Response,
    @Query('uid') uid: string,
    @Query('flight') flight: string,
  ): Promise<CreateTicketReply> {
    try {
      // lock ticket
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

      const id = list[0]?.id;
      if (!id) {
        return {
          message: 'The flight is sold out!',
        };
      }

      try {
        // try book ticket
        await retry(5, () => this.appService.bookTicket());

        return {
          ticketId: id,
        };
      } catch(e) {
        // rollback: set ticket to free
        await this.prisma.ticket.update({
          where: { id },
          data: { orderState: OrderState.FREE }
        })
        return { message: e.message };
      }

    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return { message: e.message };
    }
  }
}

async function retry<T>(time: number, f: () => Promise<T>): Promise<T> {
  if (time === 1) {
    return f();
  } else {
    try {
      const res = await f();
      return res;
    } catch(_) {
      return retry(time - 1, f);
    }
  }
}

export { AppController };
