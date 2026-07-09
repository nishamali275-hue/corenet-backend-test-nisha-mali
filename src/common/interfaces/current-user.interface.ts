import { Role } from '@prisma/client';

export interface CurrentUserData {
  id: string;
  name: string;
  email: string;
  role: Role;
}