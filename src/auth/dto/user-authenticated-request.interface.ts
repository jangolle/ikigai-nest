import { User } from '../../users/entities/user.entity';

export interface UserAuthenticatedRequest {
  user: User;
}
