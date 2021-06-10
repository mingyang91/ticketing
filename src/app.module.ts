import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BenchmarkController } from './benchmark/benchmark.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, BenchmarkController],
  providers: [PrismaService, AppService],
})
class AppModule {}

export { AppModule };
