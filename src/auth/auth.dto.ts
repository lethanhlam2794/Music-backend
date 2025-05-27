// src/auth/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'abc@gmail.com',
      })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Abcd@1234',
  })
  @IsNotEmpty()
  password: string;
}
export class CheckValidationDTO {
    @IsOptional()
    @MaxLength(100)
    @IsEmail()
    email: string;
  }
export class RegisterDto {
    @ApiProperty({
        example: 'Brian Le',
      })
      @IsString()
      @MinLength(1)
      @MaxLength(100)
      fullName: string;

      @ApiProperty({
        example: 'abc@gmail.com',
      })
      @MaxLength(100)
      @IsEmail()
      email: string;

      @ApiProperty({
        example: 'Abcd@1234',
      })
      @IsNotEmpty()
      @IsString()
      @MinLength(8)
      password: string;
  }
