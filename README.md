# Orbix Agent

Backend NestJS para mensajeria, configuracion, suscripciones y AI.

## Requisitos

- Node.js 18+
- MySQL o MariaDB
- Prisma CLI



## Instalacion

```bash
npm install
```

## Migraciones Prisma

```bash
npx prisma generate
npx prisma migrate deploy
```

## Ejecutar

```bash
npm run start:dev
```

## Notas

- Shopify fue removido en este proyecto.
- Revisa `src/main.ts` para swagger y configuracion global.
