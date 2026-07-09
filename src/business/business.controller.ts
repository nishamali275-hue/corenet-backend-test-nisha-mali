import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { BusinessService } from './business.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UpdateBusinessDto } from './dto/update-business.dto';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as currentUserInterface from '../common/interfaces/current-user.interface';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

 @Get('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
getMyBusiness(
  @CurrentUser() user: currentUserInterface.CurrentUserData,
) {
  return this.businessService.getMyBusiness(user.id);
}
  @Patch('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
updateMyBusiness(
  @CurrentUser() user: currentUserInterface.CurrentUserData,
  @Body() dto: UpdateBusinessDto,
) {
  return this.businessService.updateMyBusiness(user.id, dto);
}

  @Get(':id')
  getBusiness(@Param('id') id: string) {
    return this.businessService.findById(id);
  }
}