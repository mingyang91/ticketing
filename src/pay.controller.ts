import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrderState } from '@prisma/client';
import { AppService } from 'app.service';
import { retry } from 'pattern';
import { PrismaService } from 'prisma/prisma.service';

@Controller()
export class PayController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('/api/pay-ticket-order')
  async payingTicketOrder(
    @Res({ passthrough: true }) res: Response,
    @Query('ticketId') ticketId: string,
  ) {
    const ticket = await this.prisma.ticket.updateMany({
      where: {
        id: ticketId,
        orderState: { in: [OrderState.LOCKED_WAIT_CONFIRM, OrderState.PAYING] },
      },
      data: {
        orderState: OrderState.PAYING,
        updateTime: new Date()
      },
    });

    if (ticket.count === 0) {
      return { message: 'ticket not locked' };
    }

    try {
      await retry(10, () => this.appService.pay());
      const ticket = await this.prisma.ticket.updateMany({
        where: {
          id: ticketId,
          orderState: OrderState.PAYING,
        },
        data: {
          orderState: OrderState.PAYED,
          updateTime: new Date()
        },
      });
      return { success: ticket.count > 0 };
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return { message: e.message };
    }
  }
}
