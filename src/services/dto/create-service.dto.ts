import { IsInt, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(5)
  duration: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  price: number;
}