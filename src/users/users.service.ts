import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly inMemoryUsers: User[] = [
    {
      id: 'bcc1167e-24cf-4623-902e-8c3a8a982088',
      email: 'test@leadgen.com',
      passwordHash:
        '$2b$08$DER0uYbsyEOlspeuLyPgHOEaDs5pmksLIEn4mfiR2V/.Km/SCRnKm',
    },
  ];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.inMemoryUsers.find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.inMemoryUsers.find((user) => user.id === id);
  }
}
