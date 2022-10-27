import { IdentitySafe } from 'src/modules/identity';

export interface AuthenticatedRequest {
  identity: IdentitySafe;
}
