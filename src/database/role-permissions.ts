import { ALL_PERMISSION_KEYS, PermissionKey } from '../common/permissions/permissions.catalog';
import { ROLES, RoleName } from '../common/constants/roles';

export const ROLE_DEFINITIONS: Record<
  RoleName,
  { description: string; permissions: PermissionKey[] }
> = {
  [ROLES.ADMIN]: {
    description: 'Administrador da plataforma (todas as permissões)',
    permissions: ALL_PERMISSION_KEYS,
  },
  [ROLES.ONG_MANAGER]: {
    description: 'Gestor de uma ONG: administra abrigos, animais, voluntários e adoções da própria ONG',
    permissions: [
      'users:read',
      'ongs:read', 'ongs:update',
      'shelters:read', 'shelters:create', 'shelters:update', 'shelters:delete',
      'volunteers:read', 'volunteers:create', 'volunteers:update', 'volunteers:delete',
      'donations:read',
      'animals:read', 'animals:create', 'animals:update', 'animals:delete',
      'adopters:read',
      'questionnaires:read',
      'events:read', 'events:create', 'events:update',
      'adoption-processes:read', 'adoption-processes:review', 'adoption-processes:cancel',
      'adoption-processes:complete',
      'visits:read', 'visits:create', 'visits:update',
      'terms:read',
      'followups:read', 'followups:create', 'followups:update',
    ],
  },
  [ROLES.VOLUNTEER]: {
    description: 'Voluntário: apoia o dia a dia dos animais, visitas e acompanhamentos',
    permissions: [
      'ongs:read',
      'shelters:read',
      'animals:read', 'animals:update',
      'adopters:read',
      'questionnaires:read',
      'events:read',
      'adoption-processes:read',
      'visits:read', 'visits:create', 'visits:update',
      'terms:read',
      'followups:read', 'followups:update',
    ],
  },
  [ROLES.ADOPTER]: {
    description: 'Adotante: preenche questionário e acompanha os próprios processos',
    permissions: [
      'ongs:read',
      'shelters:read',
      'animals:read',
      'adopters:read', 'adopters:create',
      'questionnaires:read', 'questionnaires:create',
      'events:read',
      'donations:read', 'donations:create',
      'adoption-processes:read', 'adoption-processes:create', 'adoption-processes:cancel',
      'visits:read',
      'terms:read', 'terms:sign',
      'followups:read', 'followups:update',
    ],
  },
};
