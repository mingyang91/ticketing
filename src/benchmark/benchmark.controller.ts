import { OrderState } from '.prisma/client';
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { flatten, range } from 'ramda';
import { Flight } from '@prisma/client';

@Controller()
class BenchmarkController {
  constructor(private readonly prisma: PrismaService) {}

  static serial(n: number, length: number) {
    return range(1, n + 1).map((item) => item.toString().padStart(length, '0'));
  }

  static readonly ROUTES = 50;
  static readonly TRAVELERS = 10000;
  static readonly FLIGHTS = 2000;
  static readonly AIRPORTS = 1000;
  static readonly TICKETS = 8000;

  @Get('/private/api/benchmark/reset')
  async reset(): Promise<number> {
    return (await this.clearAll()) + (await this.generateAll());
  }

  async generateAll(): Promise<number> {
    const routes = await this.generateRoutes();
    const travelers = await this.generateTravelers();
    const airports = await this.generateAirports();
    const flights = await this.generateFlight();
    const tickets = await this.generateTickets(flights);
    return routes + travelers + airports + flights.length + tickets;
  }

  async clearAll(): Promise<number> {
    const tickets = await this.prisma.ticket.deleteMany();
    const flights = await this.prisma.flight.deleteMany();
    const airports = await this.prisma.airport.deleteMany();
    const travelers = await this.prisma.traveler.deleteMany();
    const routes = await this.prisma.route.deleteMany();

    return (
      tickets.count +
      flights.count +
      airports.count +
      travelers.count +
      routes.count
    );
  }

  async generateRoutes(): Promise<number> {
    const routes = BenchmarkController.serial(
      BenchmarkController.ROUTES,
      3,
    ).map((sn) => {
      return { id: 'route#' + sn };
    });

    const res = await this.prisma.route.createMany({
      data: routes,
    });

    return res.count;
  }

  async generateAirports(): Promise<number> {
    const airports = BenchmarkController.serial(
      BenchmarkController.AIRPORTS,
      4,
    ).map((sn, index) => {
      return {
        id: 'airport#' + sn,
        name: sn,
        routeId:
          'route#' +
          ((index % BenchmarkController.ROUTES) + 1)
            .toString()
            .padStart(3, '0'),
      };
    });

    const res = await this.prisma.airport.createMany({ data: airports });

    return res.count;
  }

  async generateTravelers(): Promise<number> {
    const travelers = BenchmarkController.serial(
      BenchmarkController.TRAVELERS,
      5,
    ).map((sn) => {
      return { id: 'traveler#' + sn, name: sn };
    });

    const res = await this.prisma.traveler.createMany({ data: travelers });

    return res.count;
  }

  async generateTickets(flights: Flight[]): Promise<number> {
    const tickets = flights.map((flight) => {
      return BenchmarkController.serial(flight.capacity, 3).map((sn) => {
        return {
          id: 'ticket#' + flight.id + sn,
          flightId: flight.id,
          price: (flight.basePrice + Math.random() * 1000) | 0,
          orderState: OrderState.FREE,
        };
      });
    });

    const res = await this.prisma.ticket.createMany({ data: flatten(tickets) });

    return res.count;
  }

  async generateFlight(): Promise<Flight[]> {
    const flights = BenchmarkController.serial(
      BenchmarkController.FLIGHTS,
      3,
    ).map((sn, index) => {
      return {
        id: 'flight#' + sn,
        capacity: 20 + Math.floor(Math.random() * 60),
        routeId:
          'route#' +
          ((index % BenchmarkController.ROUTES) + 1)
            .toString()
            .padStart(3, '0'),
        basePrice: (100 + Math.random() * 300) | 0,
      };
    });

    const res = await this.prisma.flight.createMany({ data: flights });

    return flights;
  }
}

export { BenchmarkController };
