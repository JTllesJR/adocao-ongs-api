import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { pageOptions, toPage } from '../../common/dto/paginate';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { ListRolesDto } from './dto/role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectModel(Role) private readonly model: typeof Role,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async findAll(query: ListRolesDto) {
    const where: WhereOptions = {};
    if (query.name) Object.assign(where, { name: { [Op.iLike]: `%${query.name}%` } });
    if (query.active !== undefined) Object.assign(where, { active: query.active });

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      ...pageOptions(query),
    });
    return toPage(rows, count, query);
  }

  findById(id: string) {
    return this.model.findByPk(id, {
      include: [{ model: Permission, through: { attributes: [] } }],
    });
  }

  findByName(name: string) {
    return this.model.findOne({ where: { name } });
  }

  create(data: { name: string; description: string | null }) {
    return this.model.create(data);
  }

  async setPermissions(role: Role, permissions: Permission[]) {
    await role.$set('permissions', permissions);
  }

  countUsers(roleId: string) {
    return this.userModel.count({ where: { roleId } });
  }
}
