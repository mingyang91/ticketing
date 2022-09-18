import { Body, Controller, Param, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrderState, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PurchaseParam, PurchasePayload, CompleteOrderReply } from 'models';
import { sortBy } from 'ramda';

class OutOfStockError extends Error {}

@Controller()
export class PayController {
  constructor(private readonly prisma: PrismaService) {}

  @Put('/api/purchase/:orderId')
  async purchase(
    @Res({ passthrough: true }) res: Response,
    @Param() param: PurchaseParam,
    @Body() payload: PurchasePayload,
  ): Promise<CompleteOrderReply> {
    // NOTE: Sorting items can prevent deadlocks in transactions.
    const items = sortBy((x) => x.productId, payload.items);

    try {
      // credit card charge
      await this.prisma.$transaction(async (prisma) => {
        await prisma.order.create({
          data: {
            id: param.orderId,
            cardNo: payload.creditCardInfo.number,
            items: {
              createMany: {
                data: items,
              },
            },
            state: OrderState.PAYED,
          },
        });

        const promises = items.map(async (item) => {
          return prisma.product.updateMany({
            data: {
              quantity: { decrement: item.quantity },
            },
            where: {
              id: item.productId,
              quantity: {
                gt: item.quantity,
              },
            },
          });
        });

        const withholding = await Promise.all(promises);

        const failed = withholding
          .map((res, index) => [res.count, index])
          .filter(([count]) => count == 0)
          .map(([, index]) => items[index]);

        if (failed.length > 0) {
          const msg = items
            .map(
              (item) =>
                `product(${item.productId}) not found or stock is less than ${item.quantity}`,
            )
            .join('\n');
          throw new OutOfStockError(msg);
        }
      });
      return { tag: 'success' };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          res.status(400);
          return { tag: 'denied', message: 'Order conflict' };
        }
      } else if (e instanceof OutOfStockError) {
        res.status(400);
        return { tag: 'denied', message: e.message };
      }
      res.status(500);
      return { tag: 'error', message: e.toString() };
    }
  }
}
