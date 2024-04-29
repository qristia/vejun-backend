import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/util/public_metadata';
import { SignInDto } from './dto/sign_in.dto';
import { TokenDto } from './dto/token.dto';
import { SignUpResponseDto } from './dto/sign_up_response.dto';
import { SignUpDto } from './dto/sign_up.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  async signIn(@Body() req: SignInDto): Promise<TokenDto> {
    return await this.authService.signIn(req.username, req.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  @Public()
  async signUp(@Body() req: SignUpDto): Promise<SignUpResponseDto> {
    return await this.authService.signUp(req.email, req.password);
  }
}
