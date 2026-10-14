import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../../common/types/auth-user';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto, ListRolesDto, SetRolePermissionsDto, UpdateRoleDto } from './dto/role.dto';
import { assertActorCanGrant } from './role-escalation';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly repo: RolesRepository,
    private readonly permissions: PermissionsService,
  ) {}

  findAll(query: ListRolesDto) {
    return this.repo.findAll(query);
  }

  async findOne(id: string) {
    const role = await this.repo.findById(id);
    if (!role) throw new NotFoundException('Perfil não encontrado');
    return role;
  }

  findByName(name: string) {
    return this.repo.findByName(name);
  }

  async findActiveOrFail(id: string) {
    const role = await this.findOne(id);
    if (!role.active) throw new BadRequestException('Esse perfil está inativo');
    return role;
  }

  async create(dto: CreateRoleDto, actor: AuthUser) {
    const name = dto.name.trim().toUpperCase();
    if (await this.repo.findByName(name)) {
      throw new ConflictException('Já existe um perfil com esse nome');
    }

    const permissions = await this.loadPermissions(dto.permissionIds ?? []);
    assertActorCanGrant(actor, permissions);

    const role = await this.repo.create({ name, description: dto.description ?? null });
    await this.repo.setPermissions(role, permissions);
    return this.findOne(role.id);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    const newName = dto.name?.trim().toUpperCase();
    if (role.isSystem && ((newName && newName !== role.name) || dto.active === false)) {
      throw new ForbiddenException('Perfil de sistema não pode ser renomeado nem desativado');
    }

    if (newName && newName !== role.name) {
      if (await this.repo.findByName(newName)) {
        throw new ConflictException('Já existe um perfil com esse nome');
      }
      role.name = newName;
    }

    if (dto.active === false && role.active) {
      const inUse = await this.repo.countUsers(id);
      if (inUse > 0) {
        throw new ConflictException(
          `Esse perfil ainda tem ${inUse} usuário(s), troque o perfil deles antes de desativar`,
        );
      }
    }

    if (dto.description !== undefined) role.description = dto.description;
    if (dto.active !== undefined) role.active = dto.active;
    await role.save();
    return this.findOne(id);
  }

  async setPermissions(id: string, dto: SetRolePermissionsDto, actor: AuthUser) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new ForbiddenException('As permissões de um perfil de sistema não podem ser alteradas');
    }

    const permissions = await this.loadPermissions(dto.permissionIds);
    // vale para o que entra e para o que já estava no perfil
    assertActorCanGrant(actor, permissions);
    assertActorCanGrant(
      actor,
      role.permissions,
      'Você não pode mexer num perfil com permissões que não tem',
    );

    await this.repo.setPermissions(role, permissions);
    return this.findOne(id);
  }

  private async loadPermissions(ids: string[]) {
    if (!ids.length) return [];
    const found = await this.permissions.findByIds(ids);
    if (found.length !== new Set(ids).size) {
      const foundIds = new Set(found.map((p) => p.id));
      const missing = ids.filter((i) => !foundIds.has(i));
      throw new BadRequestException(`Permissões que não existem: ${missing.join(', ')}`);
    }
    return found;
  }
}
