import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  role: UserRole;
  email?: string | null;
  steamId?: string | null;
}
