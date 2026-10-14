import { Injectable } from '@nestjs/common';
import { ListPermissionsDto } from './dto/list-permissions.dto';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly repo: PermissionsRepository) {}

  findAll(query: ListPermissionsDto) {
    return this.repo.findAll(query);
  }

  findByIds(ids: string[]) {
    return this.repo.findByIds(ids);
  }
}
