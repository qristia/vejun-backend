import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/util/public_metadata';
import { SignInDto } from './dto/sign_in.dto';

import { SignUpDto } from './dto/sign_up.dto';
import { Response as EResponse } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  async signIn(@Body() req: SignInDto, @Response() res: EResponse) {
    const token = await this.authService.signIn(req.username, req.password);
    res.cookie('accessToken', token.access_token, AuthService.cookieOptions);
    return res.send({ username: req.username });
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  @Public()
  async signUp(@Body() req: SignUpDto, @Response() res: EResponse) {
    const signUp = await this.authService.signUp(req.email, req.password);
    res.cookie('accessToken', signUp.access_token, AuthService.cookieOptions);
    return res.send({ id: signUp.id });
  }
}
