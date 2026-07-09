import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateServiceDto) {
    const business = await this.prisma.business.findUnique({
      where: {
        ownerId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    try {
  return await this.prisma.service.create({
    data: {
      businessId: business.id,
      name: dto.name,
      duration: dto.duration,
      price: dto.price,
    },
  });
} catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new BadRequestException(
      'A service with this name already exists.',
    );
  }

  throw error;
}
  }

  async findAll() {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
      },
      include: {
        business: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        business: true,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.service.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }
}