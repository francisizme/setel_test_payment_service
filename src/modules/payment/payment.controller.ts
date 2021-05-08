import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

import { PaymentService } from './payment.service';

import { IPaymentPayload } from './interfaces/payment.interface';
import { IUser } from './interfaces/user.interface';
import { EPaymentStatus } from '../../utils/enum';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('AUTH_CLIENT') private readonly authClient: ClientProxy,
    @Inject('ORDER_CLIENT') private readonly orderClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  @MessagePattern('pay')
  async performPayment(@Payload() input: IPaymentPayload): Promise<void> {
    const user: IUser = await this.authClient.send('verifyToken', input.user_token).toPromise();
    const orderId = input.order_id;

    if (!user) {
      this.logger.error('Invalid user token', null, PaymentController.name + '.' + this.performPayment.name);
      return this._cancelOrder(orderId);
    }

    const payment = await this.paymentService.create({
      order_id: orderId,
      payment_type: input.payment_type,
      user_id: user.id,
    });

    if (payment?.status === EPaymentStatus.paid) {
      this._confirmOrder(orderId);
    } else {
      this._cancelOrder(orderId);
    }
  }

  private _confirmOrder(orderId: number): void {
    this.orderClient.emit('confirm', orderId);
  }

  private _cancelOrder(orderId: number): void {
    this.orderClient.emit('cancel', orderId);
  }
}
