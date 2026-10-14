# adocao-ongs-api

API de adoção de animais com ONGs, trabalho da P1 de Programação Web.
NestJS, Sequelize e Postgres. O Swagger fica em `/docs`.

## Rodar

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:setup
npm run start:dev
```

`db:setup` roda as migrations e o seed. O seed cria um usuário de cada perfil
(admin@adocao.local, gestor@adocao.local, voluntario@adocao.local e adotante@adocao.local),
as senhas estão no `.env.example`.

Migrations e seeders ficam em `src/database` e usam o sequelize-cli
(`npm run migration:create -- --name nome`, `npm run migration:run`, `npm run seed`).

## Integrantes

- Joel Junior
- Daniel Rangel
- Matheus Geber
- Daniel Rodrigues
