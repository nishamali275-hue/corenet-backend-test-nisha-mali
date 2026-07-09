import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { AvailabilityService } from './availability.service';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as currentUserInterface from '../common/interfaces/current-user.interface';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: currentUserInterface.CurrentUserData,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(user.id, dto);
  }

  @Get('me')
  findMine(
    @CurrentUser() user: currentUserInterface.CurrentUserData,
  ) {
    return this.availabilityService.findMine(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.availabilityService.remove(id);
  }

  @Get(':id')
findOne(
  @CurrentUser() user: currentUserInterface.CurrentUserData,
  @Param('id') id: string,
) {
  return this.availabilityService.findOne(user.id, id);
}
}