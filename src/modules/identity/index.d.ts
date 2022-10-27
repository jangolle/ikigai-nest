import { Identity } from '@prisma/client';

export type IdentitySafe = Omit<Identity, 'passwordHash'>;
