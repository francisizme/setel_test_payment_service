import { Connection, EntityRepository, Repository } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';

import { IPayment } from '../interfaces/payment.interface';

import { Payment } from '../entities/payment.entity';

@EntityRepository(Payment)
export class PaymentRepository extends Repository<IPayment> {
  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }
}
