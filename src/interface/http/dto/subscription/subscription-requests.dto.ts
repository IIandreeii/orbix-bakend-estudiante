import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { PlanType } from '../../../../core/domain/entities/subscription.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentSessionDto {
  @ApiProperty({ enum: PlanType, required: false })
  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType;
}

export class CompletePaymentDto {
  @IsString()
  @IsNotEmpty()
  tokenId: string;

  @IsString()
  @IsNotEmpty()
  purchaseNumber: string;

  @IsEnum(PlanType)
  @IsNotEmpty()
  planType: PlanType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
