import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/dto/paginate';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ListPermissionsDto } from './dto/list-permissions.dto';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Lista as permissões do sistema (paginado, filtros: resource, action)' })
  @ApiPaginatedResponse(Permission)
  findAll(@Query() query: ListPermissionsDto) {
    return this.service.findAll(query);
  }
}
