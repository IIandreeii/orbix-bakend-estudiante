# Orbix Agent

Backend NestJS para mensajeria, configuracion, suscripciones y AI.

## Requisitos

- Node.js 18+
- MySQL o MariaDB
- Prisma CLI

## Variables de entorno

Crea un archivo `.env` y configura al menos:

- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- ENCRYPTION_KEY
- MAIL_HOST
- MAIL_PORT
- MAIL_USER
- MAIL_PASS
- MAIL_FROM
- WHATSAPP_API_BASE_URL
- WHATSAPP_API_VERSION
- WHATSAPP_VERIFY_TOKEN
- WHATSAPP_WEBHOOK_URL
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_STORAGE_BUCKET

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
