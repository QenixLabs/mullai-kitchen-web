## Mullai Kitchen Client

Next.js App Router frontend with:

- React Query for server state
- Zustand for local user/session state
- Axios for API integration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - run local development server
- `npm run lint` - run lint checks
- `npm run build` - create production build

## Folder Structure

```txt
app/
  (unauthenticated)/
  (authenticated)/
src/
  api/
  hooks/
  lib/
  providers/
  stores/
```
