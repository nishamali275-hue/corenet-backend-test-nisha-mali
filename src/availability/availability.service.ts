import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(ownerId: string, dto: CreateAvailabilityDto) {
    const business = await this.prisma.business.findUnique({
      where: {
        ownerId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.prisma.availability.create({
      data: {
        businessId: business.id,
        ...dto,
      },
    });
  }

  async findMine(ownerId: string) {
    const business = await this.prisma.business.findUnique({
      where: {
        ownerId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.prisma.availability.findMany({
      where: {
        businessId: business.id,
      },
      orderBy: {
        day: 'asc',
      },
    });
  }

  async update(id: string, dto: UpdateAvailabilityDto) {
    return this.prisma.availability.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.availability.delete({
      where: {
        id,
      },
    });
  }

  async findOne(ownerId: string, id: string) {
  const business = await this.prisma.business.findUnique({
    where: {
      ownerId,
    },
  });

  if (!business) {
    throw new NotFoundException('Business not found');
  }

  const availability = await this.prisma.availability.findFirst({
    where: {
      id,
      businessId: business.id,
    },
  });

  if (!availability) {
    throw new NotFoundException('Availability not found');
  }

  return availability;
}
}