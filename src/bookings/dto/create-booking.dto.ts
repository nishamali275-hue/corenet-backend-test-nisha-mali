import {
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  bookingDate: string;

  @IsDateString()
  startTime: string;
}