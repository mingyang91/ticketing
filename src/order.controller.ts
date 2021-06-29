import { Controller, Get, HttpStatus, OnModuleDestroy, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrderState } from '@prisma/client';
import { AppService } from 'app.service';
import { CreateOrderRawQueryResult, CreateTicketReply } from 'models';
import { retry } from 'pattern';
import { PrismaService } from 'prisma/prisma.service';
import { interval, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Controller()
export class OrderController implements OnModuleDestroy {

  private token: Subscription

  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {
    this.token = interval(1000)
      .pipe(mergeMap(() => this.scan()))
      .subscribe(res => console.debug(res))
  }

  onModuleDestroy() {
    this.token.unsubscribe
  }

  private async scan() {
    const now = new Date();
    return this.prisma.ticket.updateMany({
        where: {
            orderState: OrderState.LOCKED_WAIT_CONFIRM,
            updateTime: { lt: new Date(now.getTime() - 5 * 60 * 1000) }
        },
        data: {
            orderState: OrderState.FREE,
            updateTime: now
        }
    })
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
            "travelerId" = ${uid},
            "updateTime" = now()
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
        await retry(10, () => this.appService.bookTicket());

        return {
          ticketId: id,
        };
      } catch (e) {
        // rollback: set ticket to free
        await this.prisma.ticket.update({
          where: { id },
          data: { orderState: OrderState.FREE },
        });
        return { message: e.message };
      }
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return { message: e.message };
    }
  }

  @Get('/api/cancel-ticket-order')
  async cancelTicketOrder(
    @Res({ passthrough: true }) res: Response,
    @Query('uid') uid: string,
    @Query('ticketId') ticketId: string,
  ) {
    try {
      // lock ticket
      const result = await this.prisma.ticket.updateMany({
        where: {
          id: ticketId,
          flightId: uid,
          orderState: { in: [OrderState.ORDER_CANCELLING, OrderState.LOCKED_WAIT_CONFIRM] }
        },
        data: {
          orderState: OrderState.ORDER_CANCELLING, 
          updateTime: new Date(),
        }
      })
      
      if (result.count === 0) {
        return { message: 'order cancelled' }
      }

      try {
        // try book ticket
        await retry(10, () => this.appService.cancelTicket());
        await this.prisma.ticket.update({
          where: {
            id: ticketId,
          },
          data: {
            orderState: OrderState.FREE, 
            updateTime: new Date(),
          }
        })
        return {
          message: 'order cancelled'
        };
      } catch (e) {
        // rollback: set ticket to free
        await this.prisma.ticket.update({
          where: { id: ticketId },
          data: { orderState: OrderState.LOCKED_WAIT_CONFIRM },
        });
        return { message: e.message };
      }
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return { message: e.message };
    }
  }
}
