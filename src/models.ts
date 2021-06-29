import { OrderState } from '@prisma/client';

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
