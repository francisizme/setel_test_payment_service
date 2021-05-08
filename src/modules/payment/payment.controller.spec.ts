import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { IUser } from './interfaces/user.interface';
import { IPayment, IPaymentPayload } from './interfaces/payment.interface';
import { EPaymentStatus, EPaymentType } from '../../utils/enum';
import { Logger } from '@nestjs/common';

class PaymentServiceFake {
  async create(): Promise<void> {}
}

class OrderClientFake {
  emit(): void {}
}

class AuthClientFake {
  send(): void {}
}

class ObserverFake extends Observable<any> {
  async toPromise(): Promise<void> {}
}

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;
  let authClient: ClientProxy;
  let orderClient: ClientProxy;
  let authObserver: Observable<any>;
  let logger: Logger;
  const d = new Date();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useClass: PaymentServiceFake,
        },
        {
          provide: 'AUTH_CLIENT',
          useClass: AuthClientFake,
        },
        {
          provide: 'ORDER_CLIENT',
          useClass: OrderClientFake,
        },
        Logger,
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
    authClient = module.get<ClientProxy>('AUTH_CLIENT');
    orderClient = module.get<ClientProxy>('ORDER_CLIENT');
    authObserver = new ObserverFake();
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should cancel the Order and log if user token is invalid', async () => {
    const token = faker.git.shortSha();
    const input: IPaymentPayload = {
      order_id: 1,
      payment_type: EPaymentType.cash,
      user_token: token,
    };
    const authSendSpy = jest.spyOn(authClient, 'send').mockReturnValue(authObserver);
    jest.spyOn(authObserver, 'toPromise').mockResolvedValue(null);
    const orderSendSpy = jest.spyOn(orderClient, 'emit');
    const createPaymentSpy = jest.spyOn(service, 'create');
    const loggerSpy = jest.spyOn(logger, 'error');

    await controller.performPayment(input);

    expect(authSendSpy).toHaveBeenCalledWith('verifyToken', token);
    expect(createPaymentSpy).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalled();
    expect(orderSendSpy).toHaveBeenCalledWith('cancel', input.order_id);
  });

  it('should cancel the Order if payment is null', async () => {
    const token = faker.git.shortSha();
    const input: IPaymentPayload = {
      order_id: 1,
      payment_type: EPaymentType.cash,
      user_token: token,
    };
    const mockedUser: IUser = {
      id: 1,
      full_name: faker.name.firstName(),
      username: faker.internet.userName(),
      created_at: d,
      updated_at: d,
    };
    const authSendSpy = jest.spyOn(authClient, 'send').mockReturnValue(authObserver);
    jest.spyOn(authObserver, 'toPromise').mockResolvedValue(mockedUser);
    const orderSendSpy = jest.spyOn(orderClient, 'emit');
    const createPaymentSpy = jest.spyOn(service, 'create').mockResolvedValue(null);

    await controller.performPayment(input);

    expect(authSendSpy).toHaveBeenCalledWith('verifyToken', token);
    expect(createPaymentSpy).toHaveBeenCalledWith({
      order_id: input.order_id,
      user_id: mockedUser.id,
      payment_type: input.payment_type,
    });
    expect(orderSendSpy).toHaveBeenCalledWith('cancel', input.order_id);
  });

  it('should confirm the Order if perform payment successfully', async () => {
    const token = faker.git.shortSha();
    const input: IPaymentPayload = {
      order_id: 1,
      payment_type: EPaymentType.cash,
      user_token: token,
    };
    const mockedUser: IUser = {
      id: 1,
      full_name: faker.name.firstName(),
      username: faker.internet.userName(),
      created_at: d,
      updated_at: d,
    };
    const authSendSpy = jest.spyOn(authClient, 'send').mockReturnValue(authObserver);
    jest.spyOn(authObserver, 'toPromise').mockResolvedValue(mockedUser);
    const orderSendSpy = jest.spyOn(orderClient, 'emit');
    const mockedPayment: IPayment = {
      id: 1,
      status: EPaymentStatus.paid,
      payment_type: EPaymentType.cash,
      user_id: mockedUser.id,
      order_id: input.order_id,
      created_at: d,
      updated_at: d,
    };
    const createPaymentSpy = jest.spyOn(service, 'create').mockResolvedValue(mockedPayment);

    await controller.performPayment(input);

    expect(authSendSpy).toHaveBeenCalledWith('verifyToken', token);
    expect(createPaymentSpy).toHaveBeenCalledWith({
      order_id: input.order_id,
      user_id: mockedUser.id,
      payment_type: input.payment_type,
    });
    expect(orderSendSpy).toHaveBeenCalledWith('confirm', input.order_id);
  });

  it('should cancel the Order if perform payment failure', async () => {
    const token = faker.git.shortSha();
    const input: IPaymentPayload = {
      order_id: 1,
      payment_type: EPaymentType.cash,
      user_token: token,
    };
    const mockedUser: IUser = {
      id: 1,
      full_name: faker.name.firstName(),
      username: faker.internet.userName(),
      created_at: d,
      updated_at: d,
    };
    const authSendSpy = jest.spyOn(authClient, 'send').mockReturnValue(authObserver);
    jest.spyOn(authObserver, 'toPromise').mockResolvedValue(mockedUser);
    const orderSendSpy = jest.spyOn(orderClient, 'emit');
    const mockedPayment: IPayment = {
      id: 1,
      status: EPaymentStatus.failed,
      payment_type: EPaymentType.cash,
      user_id: mockedUser.id,
      order_id: input.order_id,
      created_at: d,
      updated_at: d,
    };
    const createPaymentSpy = jest.spyOn(service, 'create').mockResolvedValue(mockedPayment);

    await controller.performPayment(input);

    expect(authSendSpy).toHaveBeenCalledWith('verifyToken', token);
    expect(createPaymentSpy).toHaveBeenCalledWith({
      order_id: input.order_id,
      user_id: mockedUser.id,
      payment_type: input.payment_type,
    });
    expect(orderSendSpy).toHaveBeenCalledWith('cancel', input.order_id);
  });
});
