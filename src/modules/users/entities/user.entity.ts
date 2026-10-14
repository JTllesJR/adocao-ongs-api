import {
  BelongsTo,
  Column,
  DataType,
  Default,
  DefaultScope,
  ForeignKey,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Role } from '../../roles/entities/role.entity';

// por padrão o hash nunca sai nas consultas; só com o scope 'withPassword' (login)
@DefaultScope(() => ({ attributes: { exclude: ['passwordHash'] } }))
@Scopes(() => ({ withPassword: { attributes: { include: ['passwordHash'] } } }))
@Table({ tableName: 'users', paranoid: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(160), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare passwordHash: string;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare active: boolean;

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, allowNull: false })
  declare roleId: string;

  @BelongsTo(() => Role)
  declare role: Role;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare failedLoginAttempts: number;

  @Column(DataType.DATE)
  declare lockedUntil: Date | null;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}
