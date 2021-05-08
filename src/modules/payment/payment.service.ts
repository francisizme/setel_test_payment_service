import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaymentRepository } from './repositories/payment.repository';
import { EPaymentStatus, EPaymentType } from '../../utils/enum';
import { IPayment, IPaymentInsert } from './interfaces/payment.interface';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
    private readonly logger: Logger,
  ) {}

  async create(input: IPaymentInsert): Promise<IPayment> {
    if (!EPaymentType[input.payment_type]) {
      this.logger.error('Invalid payment type', null, PaymentService.name + '.' + this.create.name);
      return null;
    }

    const processResult = await this._processPayment();
    const isPaid = processResult ? EPaymentStatus.paid : EPaymentStatus.failed;

    return this.paymentRepository.save({ ...input, status: isPaid });
  }

  private _processPayment(): Promise<boolean> {
    const result = [true, false];

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(result[Math.floor(Math.random() * result.length)]);
      }, 5000);
    });
  }
}
