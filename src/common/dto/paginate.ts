import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination-query.dto';

export class PaginationMeta {
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/** limit/offset para passar no findAndCountAll */
export function pageOptions(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  return { limit, offset: (page - 1) * limit };
}

export function toPage<T>(rows: T[], total: number, query: PaginationQueryDto): Paginated<T> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  return { data: rows, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export const ApiPaginatedResponse = <M extends Type<unknown>>(model: M) =>
  applyDecorators(
    ApiExtraModels(PaginationMeta, model),
    ApiOkResponse({
      schema: {
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(model) } },
          meta: { $ref: getSchemaPath(PaginationMeta) },
        },
      },
    }),
  );
