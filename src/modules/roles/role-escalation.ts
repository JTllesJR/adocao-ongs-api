import { ForbiddenException } from '@nestjs/common';
import { permissionKey } from '../../common/permissions/permissions.catalog';
import { AuthUser } from '../../common/types/auth-user';

export function assertActorCanGrant(
  actor: AuthUser,
  permissions: { resource: string; action: string }[],
  message = 'Você não pode dar permissões que não tem',
) {
  const missing = permissions.map(permissionKey).filter((k) => !actor.permissions.includes(k));
  if (missing.length) {
    throw new ForbiddenException(`${message}: ${missing.join(', ')}`);
  }
}
