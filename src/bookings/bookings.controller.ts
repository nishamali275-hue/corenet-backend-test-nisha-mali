import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { BookingsService } from './bookings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as currentUserInterface from '../common/interfaces/current-user.interface';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
  ) {}

  @Get('slots')
  getSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(
      serviceId,
      date,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  create(
    @CurrentUser() user: currentUserInterface.CurrentUserData,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(
      user.id,
      dto,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  myBookings(
    @CurrentUser() user: currentUserInterface.CurrentUserData,
  ) {
    return this.bookingsService.myBookings(
      user.id,
    );
  }

  @Get('business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  businessBookings(
    @CurrentUser() user: currentUserInterface.CurrentUserData,
  ) {
    return this.bookingsService.businessBookings(
      user.id,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: currentUserInterface.CurrentUserData,
  ) {
    return this.bookingsService.cancel(
      id,
      user.id,
    );
  }
}