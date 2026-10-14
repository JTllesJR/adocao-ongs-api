import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../users/dto/user.dto';

const lower = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

export class RegisterDto {
  @ApiProperty({ example: 'João Adotante' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'joao@exemplo.com' })
  @lower()
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@adocao.local' })
  @lower()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@12345' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class TokensResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
}
