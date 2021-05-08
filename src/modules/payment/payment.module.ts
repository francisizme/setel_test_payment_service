import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentRepository]),
    ClientsModule.register([
      {
        name: 'AUTH_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'ORDER_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [PaymentService, Logger],
  controllers: [PaymentController],
})
export class PaymentModule {}
