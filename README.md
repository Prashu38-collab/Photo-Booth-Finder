# SnapSpot Nepal

Find photo booths in Kathmandu. Search by area, filter by booth type and features, check prices, hours, and real user reviews. Business owners can claim their booth, and admins keep listings accurate by verifying details and handling reports.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + TypeScript
- **Prisma** with **PostgreSQL**
- **Tailwind CSS** + **Leaflet** maps
- **JWT** session auth with role-based access (USER / BUSINESS_OWNER / ADMIN)
- Email verification & password reset via **Nodemailer** (SMTP)
- Auto-geocoding of booth addresses via **Photon** (OpenStreetMap)
- **Vitest** for tests

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the database:

   ```bash
   npm run db:create
   ```

3. Add your environment variables to a `.env` file:

   ```
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/snapspot_nepal"
   JWT_SECRET="some-long-random-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Optional — only needed to actually send emails (verification / password reset).
   # Without these, the app prints the links to the console instead.
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="SnapSpot Nepal <your@gmail.com>"
   ```

4. Push the schema and seed demo data:

   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

All seeded users share the password `password123`:

| Role            | Email                 |
| --------------- | --------------------- |
| Admin           | `admin@snapspot.np`   |
| Business Owner  | `owner@banhanstudio.np` |
| Regular User    | `user@gmail.com`      |

## Features

- **Explore** – browse booths on a map, filter by area, booth type, and features, sort by price or rating.
- **Booth details** – photos, opening hours, price range, features, location, and reviews.
- **Reviews** – rate booths with comments; moderation handled by admins.
- **Report a problem** – flag wrong prices, hours, location, or a closed business.
- **Favorites** – save booths you like.
- **Recommendations** – get booth suggestions based on your search.
- **Login / Register** – sign up as a user or business owner (admin role can't be self-assigned).
- **Email verification** – new accounts must verify their email before they can sign in.
- **Password reset** – "forgot password" flow sends a reset link; links expire in 1 hour.
- **Auto-geocoding** – booth addresses are looked up on the map automatically (seed + business edits).
- **Admin dashboard** – analytics, verify booths, resolve reports, moderate reviews.
- **Business dashboard** – manage your claimed booth's details, hours, photos, and address.

## Limitations

This project doesn't do these things (yet):

- **No booking or payments** – prices are for reference only; you can't book a booth or pay through the app.
- **No real photo galleries** – booth listings use placeholder images; owners can't upload photos yet.
- **No review photo uploads** – review photo fields exist in the DB but there's no upload flow.
- **No third-party login** – Google/Facebook sign-in isn't supported.
- **No notifications** – no emails, SMS, or push for claim approvals, report updates, or replies.
- **Limited coverage** – data is demo/seed data for Kathmandu only; many booths are unverified, so prices and hours may be outdated.
- **No rate limiting** – public APIs have no throttling (not production-ready for spam protection).
- **No full-text search** – search is simple filtering, not a search engine.
- **No mobile app** – web only, not fully optimized as an offline PWA.
- **Not deployed** – no production hosting, Docker setup, or CI/CD pipeline.
- **Emails in dev** – without SMTP config, verification/reset links are only printed to the console.

## Project Structure

```
prisma/
  schema.prisma        # data model
  seed.ts              # demo data (booths, users, types, features)
src/
  app/
    api/               # route handlers (auth, photobooths, admin, business)
    admin/             # admin dashboard
    business/          # business owner dashboard
    explore/           # booth search
    favorites/         # saved booths
    photobooths/[slug] # booth detail page
    recommend/         # recommendations page
    login/ register/   # auth pages
  components/          # shared UI (BoothCard, Map, Navbar, modals...)
  lib/                 # auth, db, geo, recommendation, sentiment helpers
tests/                 # unit tests
```

## Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start dev server               |
| `npm run build`  | Generate Prisma client + build |
| `npm run db:push`| Sync Prisma schema to DB       |
| `npm run db:seed`| Seed demo data                 |
| `npm test`       | Run unit tests (Vitest)        |
| `npm run lint`   | Lint with Next.js              |
