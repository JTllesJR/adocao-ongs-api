/** Usuário autenticado, disponível em `request.user` e via `@CurrentUser()`. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}
