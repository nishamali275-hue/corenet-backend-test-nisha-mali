import {
  IsEnum,
  IsMilitaryTime,
} from 'class-validator';

import { WeekDay } from '@prisma/client';

export class CreateAvailabilityDto {
  @IsEnum(WeekDay)
  day: WeekDay;

  @IsMilitaryTime()
  startTime: string;

  @IsMilitaryTime()
  endTime: string;
}