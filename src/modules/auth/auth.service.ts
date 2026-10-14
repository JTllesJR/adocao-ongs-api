import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ROLES } from '../../common/constants/roles';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// 5 senhas erradas seguidas travam a conta por 15 minutos
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly roles: RolesService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Auto-cadastro público: sempre cria o usuário com o perfil ADOPTER (nunca escolhe perfil). */
  async register(dto: RegisterDto) {
    const role = await this.roles.findByName(ROLES.ADOPTER);
    if (!role?.active) throw new InternalServerErrorException('Perfil ADOPTER não existe, rode o seed');
    const user = await this.users.createWithRole(dto, role);
    return { user: this.publicProfile(user), ...this.issueTokens(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const invalid = new UnauthorizedException('E-mail ou senha incorretos');
    const user = await this.users.findByEmailWithPassword(dto.email);
    if (!user) throw invalid;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException(
        `Muitas tentativas erradas, conta bloqueada até ${user.lockedUntil.toISOString()}`,
        423,
      );
    }
    if (!user.active) throw invalid;

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
        user.failedLoginAttempts = 0;
      }
      await this.users.save(user);
      throw invalid;
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.users.save(user);
    }
    return this.issueTokens(user.id, user.email);
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Refresh token inválido');

    const user = await this.users.findOne(payload.sub).catch(() => null);
    if (!user || !user.active) throw new UnauthorizedException('Usuário inativo ou não existe');
    return this.issueTokens(user.id, user.email);
  }

  private issueTokens(userId: string, email: string) {
    const sign = (type: JwtPayload['type'], secretKey: string, expiresKey: string) =>
      this.jwt.sign({ sub: userId, email, type }, {
        secret: this.config.getOrThrow<string>(secretKey),
        expiresIn: this.config.getOrThrow<string>(expiresKey) as JwtSignOptions['expiresIn'],
      });
    return {
      accessToken: sign('access', 'JWT_SECRET', 'JWT_EXPIRES_IN'),
      refreshToken: sign('refresh', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES_IN'),
    };
  }

  private publicProfile(user: { id: string; name: string; email: string; role: { name: string } }) {
    return { id: user.id, name: user.name, email: user.email, role: user.role.name };
  }
}
