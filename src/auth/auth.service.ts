// src/auth/auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.model';
import * as bcrypt from 'bcryptjs';
import { RegisterDto , LoginDto} from './auth.dto';
import { HttpResponse } from 'mvc-common-toolkit';
import { ERR_CODE } from 'src/constants/constants'; // import mã lỗi


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<HttpResponse> {
    console.log('RegisterDto received:', registerDto);
    const { email, password } = registerDto;

    // Kiểm tra xem password có phải là undefined không
    if (!password) {
      throw new ConflictException({
        success: false,
        message: 'Password is required',
      });
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException({
        success: false,
        message: 'Email already exists',
        code: ERR_CODE.EMAIL_ALREADY_EXISTS,
      });
    }

    console.log(`Registering user with email: ${email} and password: ${password}`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashedPassword });
    await user.save();

    return {
      message: 'User registered successfully',
      data: null,
    };
  }


  async login(loginDto: LoginDto): Promise<HttpResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      data: { accessToken },
    };
  }


}
