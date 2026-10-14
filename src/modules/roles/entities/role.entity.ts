import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Permission } from '../../permissions/entities/permission.entity';
import { RolePermission } from './role-permission.entity';

@Table({ tableName: 'roles' })
export class Role extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING(60), allowNull: false, unique: true })
  declare name: string;

  @Column(DataType.STRING(255))
  declare description: string | null;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare active: boolean;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare isSystem: boolean;

  @BelongsToMany(() => Permission, () => RolePermission)
  declare permissions: Permission[];

  declare createdAt: Date;
  declare updatedAt: Date;
}
