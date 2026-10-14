export const ROLES = {
  ADMIN: 'ADMIN',
  ONG_MANAGER: 'ONG_MANAGER',
  VOLUNTEER: 'VOLUNTEER',
  ADOPTER: 'ADOPTER',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];
