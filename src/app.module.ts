import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [TypeOrmModule.forRoot(), PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
