import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  WeekDay,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

import { generateSlots } from '../common/utils/time.util';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAvailableSlots(
    serviceId: string,
    bookingDate: string,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        business: {
          include: {
            availabilities: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const day = new Date(bookingDate)
      .toLocaleDateString('en-US', {
        weekday: 'long',
      })
      .toUpperCase() as WeekDay;

    const availability =
      service.business.availabilities.find(
        (a) => a.day === day,
      );

    if (!availability) {
      return [];
    }

    const slots = generateSlots(
      availability.startTime,
      availability.endTime,
      service.duration,
    );

    const bookings =
      await this.prisma.booking.findMany({
        where: {
          serviceId,
          bookingDate: new Date(bookingDate),
          status: BookingStatus.BOOKED,
        },
      });

    const booked = bookings.map((b) =>
      b.startTime.toISOString().substring(11, 16),
    );

    return slots.filter(
      (slot) => !booked.includes(slot),
    );
  }

  async create(
    customerId: string,
    dto: CreateBookingDto,
  ) {
    const service =
      await this.prisma.service.findUnique({
        where: {
          id: dto.serviceId,
        },
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    const start = new Date(dto.startTime);

    const end = new Date(
      start.getTime() +
        service.duration * 60 * 1000,
    );

    const exists =
      await this.prisma.booking.findFirst({
        where: {
          serviceId: dto.serviceId,
          startTime: start,
          status: BookingStatus.BOOKED,
        },
      });

    if (exists) {
      throw new BadRequestException(
        'Slot already booked',
      );
    }

    return this.prisma.booking.create({
      data: {
        customerId,
        serviceId: dto.serviceId,

        bookingDate: new Date(dto.bookingDate),

        startTime: start,

        endTime: end,

        serviceName: service.name,

        price: service.price,
      },
    });
  }

  async myBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: {
        customerId,
      },
      include: {
        service: true,
      },
    });
  }

  async businessBookings(ownerId: string) {
    return this.prisma.booking.findMany({
      where: {
        service: {
          business: {
            ownerId,
          },
        },
      },
      include: {
        customer: true,
        service: true,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
  ) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  async cancel(
    id: string,
    customerId: string,
  ) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });
  }
}