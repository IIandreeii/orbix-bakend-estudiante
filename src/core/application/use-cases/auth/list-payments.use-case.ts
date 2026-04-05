import type { ISubscriptionPaymentRepository } from '../../../domain/repositories/subscription.repository.interface';

export class ListPaymentsUseCase {
  constructor(
    private readonly paymentRepository: ISubscriptionPaymentRepository,
  ) {}

  async execute() {
    return await this.paymentRepository.findAll();
  }
}
