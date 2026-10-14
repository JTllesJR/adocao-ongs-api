import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from './role.entity';

@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare roleId: string;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare permissionId: string;
}
