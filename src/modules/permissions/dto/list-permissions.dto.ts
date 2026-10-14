import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListPermissionsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'animals', description: 'Filtra pelo recurso (igual)' })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ example: 'read', description: 'Filtra pela ação (igual)' })
  @IsOptional()
  @IsString()
  action?: string;
}
