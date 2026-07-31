# Wine Cellar

Single-user Next.js app for tracking a personal wine collection of roughly 1,200 bottles. It replaces the original spreadsheet with a password-gated catalogue, dashboard, bottle editor, consumption log, and CSV import flow.

## Tech Stack

- Next.js App Router + TypeScript
- Prisma ORM + Postgres for production
- Tailwind CSS
- Vercel Blob-compatible image upload endpoint

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npm run seed
npm run dev
```

Open `http://localhost:3000`.

The default development password is `cellar-demo` if `APP_PASSWORD` is not set.

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@host:5432/wine_cellar?sslmode=require"
APP_PASSWORD="change-me"
SESSION_SECRET="replace-with-a-long-random-string"
BLOB_READ_WRITE_TOKEN=""
RESEND_API_KEY="re_xxxxxxxxx"
REMINDER_EMAIL_FROM="Wine Cellar <reminders@example.com>"
REMINDER_EMAIL_TO="client@example.com"
CRON_SECRET="replace-with-a-long-random-cron-secret"
CRITIC_LOOKUP_API_KEY=""
```

- `DATABASE_URL`: production Postgres connection string from Vercel Postgres, Neon, Supabase, Railway, or another hosted Postgres provider.
- The URL must start with `postgresql://` or `postgres://`. If Vercel/Neon creates `POSTGRES_URL` or `POSTGRES_PRISMA_URL` instead, the build/runtime will use that automatically.
- `APP_PASSWORD`: password for the single-user login screen.
- `SESSION_SECRET`: random value stored in the auth cookie after login.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for label-photo uploads.
- `RESEND_API_KEY`: Resend API key used by monthly drinking-window reminder emails.
- `REMINDER_EMAIL_FROM`: optional verified sender address. Defaults to Resend's onboarding sender for testing.
- `REMINDER_EMAIL_TO`: recipient address for monthly reminder emails.
- `CRON_SECRET`: bearer token required by `/api/cron/reminders`.
- `CRITIC_LOOKUP_API_KEY`: optional provider key for critic-score lookup. Leave blank to keep the lookup button disabled gracefully.

## Features

- Dashboard KPIs: distinct wines, total bottles, total cellar value, count by type.
- Dashboard lists: ready to drink, coming into window next year, and out of stock.
- Catalogue with pagination, search, sorting, and filters for producer, grape, vintage, type, rating, drinking window, quantity, critic scores, and others.
- Add/edit form with all wine fields, large notes area, drag-and-drop label image preview, and cloud upload on save.
- Bottle editor supports multiple label photos, printable QR shelf labels, and optional critic-score lookup that only fills empty score fields.
- `Drink one` action decrements quantity and creates a `ConsumptionLog` record.
- Cellar History page shows all consumption logs with date-range filtering.
- Monthly email reminders list ready-to-drink, next-year-window, and restock/archive bottles.
- CSV import screen maps spreadsheet columns to app fields before creating records.

## Monthly Reminder Emails

1. Create a Resend account and API key.
2. Verify a sending domain in Resend before using this in production.
3. Set `RESEND_API_KEY`, `REMINDER_EMAIL_TO`, and `CRON_SECRET` in Vercel project settings.
4. Set `REMINDER_EMAIL_FROM` to an address on your verified domain when sending to the client.
5. Deploy, then confirm the Cron Jobs entry appears in the Vercel dashboard.
6. Test manually with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/reminders
```

## Deployment

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Create a Vercel project from the repository.
3. Add a hosted Postgres database and set `DATABASE_URL`.
4. Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`.
5. Add `APP_PASSWORD` and `SESSION_SECRET` in Vercel project settings.
6. Deploy. Vercel uses `npm run vercel-build`, which runs:

```bash
prisma generate && prisma migrate deploy && next build
```

The app uses standard Next.js route handlers and needs no custom server config.

Do not use the local SQLite database file on Vercel. Vercel serverless deployments do not provide persistent writable disk for app data.

## Desktop Windows App

Build the offline Windows installer with:

```bash
npm run desktop:dist
```

The desktop app packages the Next.js standalone server and uses a local SQLite database in the user's app data folder. Label photos are stored locally too, so the installed app can run without internet access. The default desktop password is `cellar-demo` unless `APP_PASSWORD` is set while building/running the app.
