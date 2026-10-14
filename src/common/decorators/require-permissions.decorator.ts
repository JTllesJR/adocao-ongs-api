import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../permissions/permissions.catalog';

export const PERMISSIONS_KEY = 'permissions';

/** Exige que o usuário tenha TODAS as permissões listadas. Ex.: @RequirePermissions('animals:read') */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
