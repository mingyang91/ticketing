import { OrderState } from '@prisma/client';
import {
  IsCreditCard,
  Matches,
  IsUUID,
  IsInt,
  IsPositive,
  ValidateNested,
  IsDefined,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseParam {
  @IsUUID()
  @IsDefined()
  orderId: string;
}

export class OrderItem {
  @IsUUID()
  @IsDefined()
  productId: string;
  @IsInt()
  @IsPositive()
  @IsDefined()
  quantity: number;
}

export class CreditCardInfo {
  @IsCreditCard()
  @IsDefined()
  number: string;
  @Matches(/(0[0-9])|(1[0-2])[/][0-9]{2}/g)
  @IsDefined()
  expireDate: string;
  @Matches(/[0-9]{3}/g)
  @IsDefined()
  CVC: string;
}

export class PurchasePayload {
  @ValidateNested()
  @IsDefined()
  @Type(() => CreditCardInfo)
  creditCardInfo: CreditCardInfo;

  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => OrderItem)
  items: OrderItem[];
}

export type CompleteOrderSuccess = {
  tag: 'success';
};

export type CompleteOrderDenied = {
  tag: 'denied';
  message: string;
};

export type CompleteOrderError = {
  tag: 'error';
  message: string;
};

export type CompleteOrderReply =
  | CompleteOrderSuccess
  | CompleteOrderDenied
  | CompleteOrderError;

export type FreeTicket = {
  id: string;
  flightId: string;
  price: number;
  orderState: typeof OrderState.FREE;
};

export type LockedTicket = {
  id: string;
  flightId: string;
  travelerId: string;
  price: number;
  orderState: typeof OrderState.LOCKED_WAIT_CONFIRM;
};

export type PayingTicket = {
  id: string;
  flightId: string;
  travelerId: string;
  price: number;
  orderState: typeof OrderState.PAYING;
};

export type PayedTicket = {
  id: string;
  flightId: string;
  travelerId: string;
  price: number;
  orderState: typeof OrderState.PAYED;
};

export type TicketType = FreeTicket | LockedTicket | PayingTicket | PayedTicket;

export type CreateTicketSuccess = {
  ticketId: string;
};

export type CreateTicketError = {
  message: string;
};

export type CreateTicketReply = CreateTicketSuccess | CreateTicketError;

export type CreateOrderRawQueryResult = {
  id: string;
};
