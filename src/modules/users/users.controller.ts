import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiPaginatedResponse } from '../../common/dto/paginate';
import { AuthUser } from '../../common/types/auth-user';
import { CreateUserDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Lista usuários (paginado, filtros: name, email, roleId, active)' })
  @ApiPaginatedResponse(User)
  findAll(@Query() query: ListUsersDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Detalha um usuário' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Cria um usuário com o perfil informado (uso administrativo)' })
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Atualiza nome, e-mail, perfil ou status do usuário' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.update(id, dto, actor);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Exclui (soft delete) um usuário' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthUser) {
    return this.service.remove(id, actor);
  }
}
