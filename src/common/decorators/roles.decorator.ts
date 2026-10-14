import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../constants/roles';

export const ROLES_KEY = 'roles';

// restringe a rota a determinados perfis, ex.: @Roles('ADMIN')
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
