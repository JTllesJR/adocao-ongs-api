import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'permissions', timestamps: false })
export class Permission extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING(60), allowNull: false })
  declare resource: string;

  @Column({ type: DataType.STRING(60), allowNull: false })
  declare action: string;

  @Column(DataType.STRING(255))
  declare description: string | null;
}
