import { IdentitySafe } from 'src/modules/identity';

export interface AuthenticatedRequest {
  user: IdentitySafe;
}
