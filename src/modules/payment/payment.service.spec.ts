import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaymentService } from './payment.service';

import { Payment } from './entities/payment.entity';

import { IPayment, IPaymentInsert } from './interfaces/payment.interface';
import { EPaymentStatus, EPaymentType } from '../../utils/enum';
import { Logger } from '@nestjs/common';

class PaymentRepositoryFake {
  async save(): Promise<void> {}
}

describe('PaymentService', () => {
  let service: PaymentService;
  let repository: Repository<IPayment>;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useClass: PaymentRepositoryFake,
        },
        Logger,
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repository = module.get<Repository<IPayment>>(getRepositoryToken(Payment));
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null and log if payment type is invalid', async () => {
    const input: IPaymentInsert = {
      order_id: 1,
      user_id: 1,
      payment_type: 3,
    };
    const paymentSaveSpy = jest.spyOn(repository, 'save');
    const loggerSpy = jest.spyOn(logger, 'error');
    jest.spyOn<any, any>(service, '_processPayment');

    const payment = await service.create(input);

    expect(paymentSaveSpy).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalled();
    expect(payment).toBeNull();
  });

  it('should save a successful cash payment transaction', async () => {
    const input: IPaymentInsert = {
      order_id: 1,
      user_id: 1,
      payment_type: EPaymentType.cash,
    };
    const mockedPayment: IPayment = {
      id: 1,
      payment_type: EPaymentType.cash,
      order_id: 1,
      user_id: 1,
      status: EPaymentStatus.paid,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const paymentSaveSpy = jest.spyOn(repository, 'save').mockResolvedValue(mockedPayment);
    jest.spyOn<any, any>(service, '_processPayment').mockReturnValue(true);

    const payment = await service.create(input);

    expect(paymentSaveSpy).toHaveBeenCalledWith({
      ...input,
      status: EPaymentStatus.paid,
    });
    expect(payment).toBe(mockedPayment);
  });

  it('should save a successful credit payment transaction', async () => {
    const input: IPaymentInsert = {
      order_id: 1,
      user_id: 1,
      payment_type: EPaymentType.credit,
    };
    const mockedPayment: IPayment = {
      id: 1,
      payment_type: EPaymentType.credit,
      order_id: 1,
      user_id: 1,
      status: EPaymentStatus.paid,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const paymentSaveSpy = jest.spyOn(repository, 'save').mockResolvedValue(mockedPayment);
    jest.spyOn<any, any>(service, '_processPayment').mockReturnValue(true);

    const payment = await service.create(input);

    expect(paymentSaveSpy).toHaveBeenCalledWith({
      ...input,
      status: EPaymentStatus.paid,
    });
    expect(payment).toBe(mockedPayment);
  });

  it('should save a failure cash payment transaction', async () => {
    const input: IPaymentInsert = {
      order_id: 1,
      user_id: 1,
      payment_type: EPaymentType.cash,
    };
    const mockedPayment: IPayment = {
      id: 1,
      payment_type: EPaymentType.cash,
      order_id: 1,
      user_id: 1,
      status: EPaymentStatus.paid,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const paymentSaveSpy = jest.spyOn(repository, 'save').mockResolvedValue(mockedPayment);
    jest.spyOn<any, any>(service, '_processPayment').mockReturnValue(false);

    const payment = await service.create(input);

    expect(paymentSaveSpy).toHaveBeenCalledWith({
      ...input,
      status: EPaymentStatus.failed,
    });
    expect(payment).toBe(mockedPayment);
  });

  it('should save a failure credit payment transaction', async () => {
    const input: IPaymentInsert = {
      order_id: 1,
      user_id: 1,
      payment_type: EPaymentType.credit,
    };
    const mockedPayment: IPayment = {
      id: 1,
      payment_type: EPaymentType.credit,
      order_id: 1,
      user_id: 1,
      status: EPaymentStatus.paid,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const paymentSaveSpy = jest.spyOn(repository, 'save').mockResolvedValue(mockedPayment);
    jest.spyOn<any, any>(service, '_processPayment').mockReturnValue(false);

    const payment = await service.create(input);

    expect(paymentSaveSpy).toHaveBeenCalledWith({
      ...input,
      status: EPaymentStatus.failed,
    });
    expect(payment).toBe(mockedPayment);
  });
});
