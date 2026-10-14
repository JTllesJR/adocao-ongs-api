import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiPaginatedResponse } from '../../common/dto/paginate';
import { AuthUser } from '../../common/types/auth-user';
import { CreateRoleDto, ListRolesDto, SetRolePermissionsDto, UpdateRoleDto } from './dto/role.dto';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Lista perfis (paginado, filtros: name, active)' })
  @ApiPaginatedResponse(Role)
  findAll(@Query() query: ListRolesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Detalha um perfil com suas permissões' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('roles:create')
  @ApiOperation({ summary: 'Cria um perfil' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  @ApiOperation({ summary: 'Atualiza nome, descrição ou status do perfil' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/permissions')
  @Roles('ADMIN', 'ONG_MANAGER')
  @RequirePermissions('roles:assign-permissions')
  @ApiOperation({ summary: 'Substitui o conjunto de permissões do perfil' })
  setPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetRolePermissionsDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.setPermissions(id, dto, actor);
  }
}
