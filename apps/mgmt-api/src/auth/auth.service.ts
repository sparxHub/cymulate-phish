import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private users: UsersService) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new UnauthorizedException('User exists');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, hash);
    return this.sign(user.id as string, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.sign(user.id as string, user.email);
  }

  private sign(sub: string, email: string): { token: string } {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const token = sign({ sub, email }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { token };
  }
}
