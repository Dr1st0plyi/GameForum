import { UserRole } from '@prisma/client';
export interface AuthenticatedUser {
    id: number;
    email?: string | null;
    steamId?: string | null;
    role: UserRole;
}
