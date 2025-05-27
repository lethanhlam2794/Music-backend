// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto , LoginDto} from './auth.dto';

import { ApiTags } from '@nestjs/swagger';
import { HttpResponse } from 'mvc-common-toolkit';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<HttpResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<HttpResponse>  {
    return this.authService.login(loginDto);
  }
}
