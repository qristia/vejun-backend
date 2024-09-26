import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import { SignUpResponseDto } from './dto/sign_up_response.dto';
import { CookieOptions } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  static getCookieOptions() {
    return {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      sameSite: 'strict',
      httpOnly: true,
      signed: true,
    } as CookieOptions;
  }

  async signIn(email: string, password: string): Promise<TokenDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const correct = await compare(password, user.pass);
    if (!correct) {
      throw new UnauthorizedException('Wrong email or password');
    }

    return { access_token: await this.makeAccessToken(user._id.toString()) };
  }

  async signUp(
    email: string,
    password: string,
    username?: string,
  ): Promise<SignUpResponseDto> {
    const exists = await this.usersService.findByEmail(email);
    if (exists) {
      throw new UnauthorizedException('email already in use');
    }
    const hashedPass = await hash(password, 10);
    const name = username || email.split('@')[0];
    const user = await this.usersService.createUser(email, hashedPass, name);
    return {
      id: user._id.toString(),
      access_token: await this.makeAccessToken(user._id.toString()),
    };
  }

  async logout() {
    this;
  }

  private async makeAccessToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: 'secret',
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: 'secret',
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
