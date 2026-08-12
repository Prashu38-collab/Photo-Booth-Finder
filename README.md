# SnapSpot Nepal

Find photo booths in Kathmandu. Search by area, filter by booth type and features, check prices, hours, and real user reviews. Business owners can claim their booth, and admins keep listings accurate by verifying details and handling reports.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + TypeScript
- **Prisma** with **PostgreSQL**
- **Tailwind CSS** + **Leaflet** maps
- **JWT** session auth with role-based access (USER / BUSINESS_OWNER / ADMIN)
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
- **Admin dashboard** – analytics, verify booths, resolve reports, moderate reviews.
- **Business dashboard** – manage your claimed booth's details, hours, and photos.

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
