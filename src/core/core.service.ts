import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export enum UserRole {
  ADMIN = 'admin',
  NORMAL = 'normal',
  LIMITED = 'limited',
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: UserRole.ADMIN,
    },
    {
      id: 2,
      username: 'normal',
      password: 'normal123',
      role: UserRole.NORMAL,
    },
    {
      id: 3,
      username: 'limited',
      password: 'limited123',
      role: UserRole.LIMITED,
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }
}
