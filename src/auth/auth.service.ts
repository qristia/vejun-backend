import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import { SignUpResponseDto } from './dto/sign_up_response.dto';
import { CookieOptions } from 'express';

@Injectable()
export class AuthService {
  static cookieOptions: CookieOptions = {
    expires: new Date(new Date().getTime() + 60 * 60 * 24 * 1000),
    sameSite: 'strict',
    httpOnly: true,
    signed: true,
  };

  constructor(
    @Inject(UsersService)
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<TokenDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const correct = await compare(password, user.pass);

    if (!correct) {
      throw new UnauthorizedException('Wrong password');
    }

    return { access_token: await this.makeAccessToken(user._id.toString()) };
  }

  private async makeAccessToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: 'secret',
    });
  }

  async signUp(email: string, password: string): Promise<SignUpResponseDto> {
    const exists = await this.usersService.findByEmail(email);
    if (exists) {
      throw new UnauthorizedException('email already in use');
    }

    const hashedPass = await hash(password, 10);
    const user = await this.usersService.createUser(email, hashedPass);
    return {
      id: user._id.toString(),
      access_token: await this.makeAccessToken(user._id.toString()),
    };
  }
}
