import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyBusiness(ownerId: string) {
    const business = await this.prisma.business.findUnique({
      where: {
        ownerId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async updateMyBusiness(ownerId: string, dto: UpdateBusinessDto) {
    return this.prisma.business.update({
      where: {
        ownerId,
      },
      data: dto,
    });
  }

  async findById(id: string) {
    return this.prisma.business.findUnique({
      where: {
        id,
      },
    });
  }
}