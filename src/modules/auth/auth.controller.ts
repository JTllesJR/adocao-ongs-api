import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto, TokensResponseDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Auto-cadastro de adotante (perfil ADOPTER)' })
  @ApiCreatedResponse({ description: 'Usuário criado + tokens' })
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login (trava a conta depois de 5 tentativas erradas)' })
  @ApiOkResponse({ type: TokensResponseDto })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Troca um refresh token válido por novos tokens' })
  @ApiOkResponse({ type: TokensResponseDto })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.service.refresh(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados e permissões do usuário autenticado' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
