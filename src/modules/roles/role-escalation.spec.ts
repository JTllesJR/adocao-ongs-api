import { ForbiddenException } from '@nestjs/common';
import { AuthUser } from '../../common/types/auth-user';
import { assertActorCanGrant } from './role-escalation';

const actor = (permissions: string[]): AuthUser => ({
  id: '1',
  name: 'x',
  email: 'x@x.com',
  role: 'R',
  permissions,
});

describe('assertActorCanGrant', () => {
  it('permite conceder permissões que o autor possui', () => {
    expect(() =>
      assertActorCanGrant(actor(['animals:read', 'animals:create']), [
        { resource: 'animals', action: 'read' },
      ]),
    ).not.toThrow();
  });

  it('bloqueia conceder permissão que o autor não possui e lista as faltantes', () => {
    expect(() =>
      assertActorCanGrant(actor(['animals:read']), [
        { resource: 'animals', action: 'read' },
        { resource: 'users', action: 'delete' },
      ]),
    ).toThrow(/users:delete/);
  });

  it('lança ForbiddenException', () => {
    expect(() => assertActorCanGrant(actor([]), [{ resource: 'ongs', action: 'read' }])).toThrow(
      ForbiddenException,
    );
  });

  it('conjunto vazio é sempre permitido', () => {
    expect(() => assertActorCanGrant(actor([]), [])).not.toThrow();
  });
});
