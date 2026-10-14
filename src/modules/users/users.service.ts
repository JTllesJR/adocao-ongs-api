import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ROLES } from '../../common/constants/roles';
import { AuthUser } from '../../common/types/auth-user';
import { Role } from '../roles/entities/role.entity';
import { assertActorCanGrant } from '../roles/role-escalation';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly roles: RolesService,
  ) {}

  findAll(query: ListUsersDto) {
    return this.repo.findAll(query);
  }

  async findOne(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  findByEmailWithPassword(email: string) {
    return this.repo.findByEmailWithPassword(email);
  }

  save(user: User) {
    return user.save();
  }

  async create(dto: CreateUserDto, actor: AuthUser) {
    const role = await this.roles.findActiveOrFail(dto.roleId);
    assertActorCanGrant(
      actor,
      role.permissions,
      'Você não pode dar um perfil com permissões que não tem',
    );
    return this.createWithRole(dto, role);
  }

  /** também usado no auto-cadastro (AuthService.register) */
  async createWithRole(data: { name: string; email: string; password: string }, role: Role) {
    await this.assertEmailAvailable(data.email);
    const user = await this.repo.create({
      name: data.name.trim(),
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      roleId: role.id,
    });
    return this.findOne(user.id);
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthUser) {
    const user = await this.findOne(id);
    assertActorCanGrant(
      actor,
      user.role.permissions,
      'Você não pode mexer num usuário com perfil acima do seu',
    );

    const changingRole = !!dto.roleId && dto.roleId !== user.roleId;
    const deactivating = dto.active === false && user.active;

    if (changingRole || deactivating) {
      if (actor.id === id) {
        throw new ForbiddenException(
          'Você não pode trocar seu próprio perfil nem desativar sua conta',
        );
      }
      await this.assertNotLastAdmin(user);
    }

    if (changingRole) {
      const role = await this.roles.findActiveOrFail(dto.roleId!);
      assertActorCanGrant(
        actor,
        role.permissions,
        'Você não pode dar um perfil com permissões que não tem',
      );
      user.roleId = role.id;
    }

    if (dto.email && dto.email !== user.email) {
      await this.assertEmailAvailable(dto.email);
      user.email = dto.email;
    }
    if (dto.name) user.name = dto.name.trim();
    if (dto.active !== undefined) user.active = dto.active;

    await user.save();
    return this.findOne(id);
  }

  async remove(id: string, actor: AuthUser) {
    const user = await this.findOne(id);
    if (actor.id === id) throw new ForbiddenException('Você não pode excluir sua própria conta');
    assertActorCanGrant(
      actor,
      user.role.permissions,
      'Você não pode mexer num usuário com perfil acima do seu',
    );
    await this.assertNotLastAdmin(user);
    await user.destroy();
  }

  private async assertEmailAvailable(email: string) {
    if (await this.repo.emailExists(email)) throw new ConflictException('E-mail já cadastrado');
  }

  private async assertNotLastAdmin(target: User) {
    if (target.role.name !== ROLES.ADMIN || !target.active) return;
    const others = await this.repo.countOtherActiveByRoleName(target.id, ROLES.ADMIN);
    if (others === 0) {
      throw new ConflictException('Precisa sobrar pelo menos um admin ativo');
    }
  }
}
