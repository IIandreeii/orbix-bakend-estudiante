import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NiubizAdapter } from '../niubiz/niubiz.adapter';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'IPaymentGateway',
      useClass: NiubizAdapter,
    },
  ],
  exports: ['IPaymentGateway'],
})
export class PaymentsModule {}
