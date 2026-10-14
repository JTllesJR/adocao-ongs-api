export const PERMISSION_CATALOG = {
  // acesso
  users: ['read', 'create', 'update', 'delete'],
  roles: ['read', 'create', 'update', 'assign-permissions'],
  permissions: ['read'],

  // instituições
  ongs: ['read', 'create', 'update', 'delete'],
  shelters: ['read', 'create', 'update', 'delete'],
  volunteers: ['read', 'create', 'update', 'delete'],
  donations: ['read', 'create'],

  // animais e adotantes
  animals: ['read', 'create', 'update', 'delete'],
  adopters: ['read', 'create'],
  questionnaires: ['read', 'create'],
  events: ['read', 'create', 'update'],

  // processo de adoção
  'adoption-processes': ['read', 'create', 'review', 'cancel', 'complete'],
  visits: ['read', 'create', 'update'],
  terms: ['read', 'sign'],
  followups: ['read', 'create', 'update'],
} as const;

export type PermissionResource = keyof typeof PERMISSION_CATALOG;

export type PermissionKey = {
  [R in PermissionResource]: `${R}:${(typeof PERMISSION_CATALOG)[R][number]}`;
}[PermissionResource];

export const ALL_PERMISSION_KEYS: PermissionKey[] = (
  Object.entries(PERMISSION_CATALOG) as [PermissionResource, readonly string[]][]
).flatMap(([resource, actions]) => actions.map((a) => `${resource}:${a}` as PermissionKey));

export function permissionKey(p: { resource: string; action: string }): string {
  return `${p.resource}:${p.action}`;
}
