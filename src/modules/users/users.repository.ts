import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { pageOptions, toPage } from '../../common/dto/paginate';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { ListUsersDto } from './dto/user.dto';
import { User } from './entities/user.entity';

const withRolePermissions = [
  { model: Role, include: [{ model: Permission, through: { attributes: [] } }] },
];

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User) private readonly model: typeof User) {}

  async findAll(query: ListUsersDto) {
    const where: WhereOptions = {};
    if (query.name) Object.assign(where, { name: { [Op.iLike]: `%${query.name}%` } });
    if (query.email) Object.assign(where, { email: { [Op.iLike]: `%${query.email}%` } });
    if (query.roleId) Object.assign(where, { roleId: query.roleId });
    if (query.active !== undefined) Object.assign(where, { active: query.active });

    const { rows, count } = await this.model.findAndCountAll({
      where,
      include: [Role],
      order: [['createdAt', 'DESC']],
      ...pageOptions(query),
    });
    return toPage(rows, count, query);
  }

  findById(id: string) {
    return this.model.findByPk(id, { include: withRolePermissions });
  }

  findByEmailWithPassword(email: string) {
    return this.model.scope('withPassword').findOne({ where: { email } });
  }

  /** inclui usuários excluídos (soft delete), pois o e-mail continua único no banco */
  async emailExists(email: string) {
    const count = await this.model.count({ where: { email }, paranoid: false });
    return count > 0;
  }

  create(data: { name: string; email: string; passwordHash: string; roleId: string }) {
    return this.model.create(data);
  }

  /** quantos outros usuários ativos têm o perfil informado */
  countOtherActiveByRoleName(excludeId: string, roleName: string) {
    return this.model.count({
      where: { id: { [Op.ne]: excludeId }, active: true },
      include: [{ model: Role, where: { name: roleName }, required: true }],
    });
  }
}
