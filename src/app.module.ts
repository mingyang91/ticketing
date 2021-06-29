import { Module, OnModuleDestroy } from '@nestjs/common';
import { OrderController } from 'order.controller';
import { PayController } from 'pay.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BenchmarkController } from './benchmark/benchmark.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, BenchmarkController, OrderController, PayController],
  providers: [PrismaService, AppService],
})
class AppModule implements OnModuleDestroy {
  onModuleDestroy() {
    console.log('Safe terminating...');
  }
}

export { AppModule };
