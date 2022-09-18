import { Module, OnModuleDestroy } from '@nestjs/common';
import { PayController } from 'pay.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, PayController],
  providers: [PrismaService, AppService],
})
class AppModule implements OnModuleDestroy {
  onModuleDestroy() {
    console.log('Safe terminating...');
  }
}

export { AppModule };
