---
name: nextjs-data-fetching
description: >
  Guides Next.js App Router data fetching patterns. Use this skill whenever the
  user asks about fetching data in Next.js, API calls from components, Server
  Actions, route handlers, SWR, React Query, caching, revalidation, streaming,
  Suspense boundaries, loading states, error handling for async data, or
  anything related to getting data into components. Trigger even if the user
  just says "how do I get data" or "I need to fetch from my API" in a Next.js
  context.
---

# Next.js Data Fetching Patterns

## Decision Tree — Pick Your Pattern First

```
Is the component a Server Component?
├── YES → fetch() directly in the component body (see §1)
│         Need mutations? → Server Action (see §2)
│         Need a public API endpoint? → Route Handler (see §3)
└── NO  → Need real-time/frequent updates? → SWR or React Query (see §4)
          One-time client fetch? → useEffect + fetch (acceptable, see §4)
```

Read `references/patterns.md` for full code examples of each pattern.

---

## §1 · Server Component Fetch (default — prefer this)

Fetch directly in `async` Server Components. No useEffect, no useState.

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetchPosts();          // await at the top level
  return <PostList posts={posts} />;
}

async function fetchPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 },               // ISR: refresh every 60 s
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}
```

**Caching options** (pass inside `{ next: {} }` or as `cache`):

| Goal | Option |
|---|---|
| Cache forever (build time) | `cache: 'force-cache'` |
| Cache with time-based refresh | `next: { revalidate: N }` (seconds) |
| Always fresh | `cache: 'no-store'` |
| Tag-based invalidation | `next: { tags: ['posts'] }` + `revalidateTag('posts')` |

**Rules:**
- `cookies()`, `headers()`, `searchParams` make a route dynamic — intentional is fine, but be aware.
- Parallel fetches: use `Promise.all` so requests aren't sequential.
- Never fetch from a Server Component inside a Client Component — pass data as props instead.

---

## §2 · Server Actions (mutations)

Use for form submissions and data mutations. Call from Client Components without a separate API route.

```tsx
// app/posts/actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  revalidateTag('posts');                   // bust cache after mutation
}
```

```tsx
// app/posts/new/page.tsx  (Client Component)
'use client';
import { createPost } from '../actions';

export default function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Rules:**
- Always validate and sanitize input server-side.
- Return structured errors; don't throw to the client.
- Use `useActionState` (Next 15+) or `useFormStatus` for loading/error UI.

---

## §3 · Route Handlers (public API endpoints)

Only create these when you need a true HTTP endpoint (webhooks, external consumers, file downloads).

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get('limit') ?? 10);
  const posts = await db.post.findMany({ take: limit });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // validate body here
  const post = await db.post.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
```

**Rules:**
- Do not call your own route handlers from Server Components — call the data layer directly.
- Add auth checks at the top of every handler.
- Use `NextResponse.json()` over `new Response(JSON.stringify(...))`.

---

## §4 · Client-Side Fetching (when you need it)

Use for dashboards, real-time data, or user-specific content that must not be cached.

**SWR (recommended):**
```tsx
'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function LiveStats() {
  const { data, error, isLoading } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000,
  });
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <StatsDisplay data={data} />;
}
```

**Rules:**
- Always handle `isLoading` and `error` states.
- Wrap in `Suspense` when mixing with Server Components.

---

## §5 · Streaming with Suspense

Stream slow data so fast parts render immediately.

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { SlowWidget, Skeleton } from './widgets';

export default function Dashboard() {
  return (
    <div>
      <QuickWidget />                        {/* renders instantly */}
      <Suspense fallback={<Skeleton />}>
        <SlowWidget />                       {/* streams in when ready */}
      </Suspense>
    </div>
  );
}
```

```tsx
// app/dashboard/widgets.tsx
export async function SlowWidget() {
  const data = await fetchSlowData();       // Next.js streams this
  return <Chart data={data} />;
}
```

---

## §6 · Error Handling

Always handle fetch errors — never let them silently fail.

```tsx
// app/posts/error.tsx  (Next.js error boundary)
'use client';
export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

For more complete examples of each pattern, read `references/patterns.md`.