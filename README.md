# VetAI — Next.js

Next.js App Router port of the VetAI app. The original TanStack Start project in the repo root is unchanged.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Radix UI** (via shadcn-style components)
- **Supabase** auth
- **Lovable Cloud Auth** (Google OAuth)

## Routes

| Route       | Description                          |
| ----------- | ------------------------------------ |
| `/`         | Landing page                         |
| `/auth`     | Login / sign up                      |
| `/diagnose` | Dog diagnosis flow                   |

## Getting started

```bash
cd nextjs
npm install
cp .env.example .env.local   # add your Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable                               | Description              |
| -------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `NEXT_PUBLIC_API_URL`                  | VetAI ML backend (default: `http://localhost:8000`) |

## API integration

The diagnose flow calls the VetAI FastAPI backend:

- `POST /breed` — upload `dog_image` → breed + confidence
- `POST /diagnose` — upload `dog_image` + `lesion_image` → full treatment & diet plan

Start the backend separately (see `vetai_backend/` in your Downloads folder):

```bash
cd vetai_backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
