import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { pageOptions, toPage } from '../../common/dto/paginate';
import { ListPermissionsDto } from './dto/list-permissions.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(@InjectModel(Permission) private readonly model: typeof Permission) {}

  async findAll(query: ListPermissionsDto) {
    const where: Record<string, string> = {};
    if (query.resource) where.resource = query.resource;
    if (query.action) where.action = query.action;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: [
        ['resource', 'ASC'],
        ['action', 'ASC'],
      ],
      ...pageOptions(query),
    });
    return toPage(rows, count, query);
  }

  findByIds(ids: string[]) {
    return this.model.findAll({ where: { id: ids } });
  }
}
