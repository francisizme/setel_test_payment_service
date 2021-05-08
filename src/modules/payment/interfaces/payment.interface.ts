import { Payment } from '../entities/payment.entity';

import { EPaymentType } from '../../../utils/enum';

export type IPayment = Payment;

export interface IPaymentPayload {
  order_id: number;
  user_token: string;
  payment_type: EPaymentType;
}

export interface IPaymentInsert {
  order_id: number;
  user_id: number;
  payment_type: EPaymentType;
}
