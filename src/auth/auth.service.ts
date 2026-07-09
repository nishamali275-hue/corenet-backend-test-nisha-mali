import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Role } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerOwner(dto: RegisterOwnerDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: Role.OWNER,

        business: {
          create: {
            businessName: dto.businessName,
            phone: dto.phone,
            address: dto.address,
          },
        },
      },
      include: {
        business: true,
      },
    });

    const token = await this.generateToken(user);

    return {
      message: 'Owner registered successfully',
      accessToken: token,
      user,
    };
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: Role.CUSTOMER,
    });

    const token = await this.generateToken(user);

    return {
      message: 'Customer registered successfully',
      accessToken: token,
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const matched = await bcrypt.compare(dto.password, user.password);

    if (!matched) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = await this.generateToken(user);

    return {
      accessToken: token,
      user,
    };
  }

  private async generateToken(user: any) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}