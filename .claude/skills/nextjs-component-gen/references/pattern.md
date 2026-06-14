# Data Fetching — Extended Examples

## Parallel Fetching (avoid waterfalls)

```tsx
// ❌ Sequential — slow (each awaits the previous)
const user = await getUser(id);
const posts = await getPosts(user.id);
const comments = await getComments(user.id);

// ✅ Parallel — fast
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
]);
```

## Tag-Based Cache Invalidation

```ts
// Fetch with a tag
const res = await fetch('/api/posts', { next: { tags: ['posts'] } });

// Server Action that busts the tag after a mutation
'use server';
import { revalidateTag } from 'next/cache';

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidateTag('posts');
}
```

## useActionState for Form Feedback (Next.js 15+)

```tsx
'use client';
import { useActionState } from 'react';
import { createPost } from './actions';

const initialState = { error: null, success: false };

export function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <input name="title" disabled={isPending} />
      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">Post created!</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create Post'}
      </button>
    </form>
  );
}
```

```ts
// app/posts/actions.ts
'use server';
import { revalidateTag } from 'next/cache';

export async function createPost(prevState: unknown, formData: FormData) {
  const title = formData.get('title') as string;
  if (!title?.trim()) return { error: 'Title is required', success: false };

  try {
    await db.post.create({ data: { title } });
    revalidateTag('posts');
    return { error: null, success: true };
  } catch {
    return { error: 'Database error', success: false };
  }
}
```

## Dynamic Route with Params (Next.js 15 — params is a Promise)

```tsx
// app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;             // must await in Next.js 15+
  const post = await getPost(id);
  if (!post) notFound();
  return <PostDetail post={post} />;
}

export async function generateStaticParams() {
  const posts = await db.post.findMany({ select: { id: true } });
  return posts.map(p => ({ id: p.id }));
}
```

## Optimistic Updates with SWR

```tsx
'use client';
import useSWR, { useSWRConfig } from 'swr';

export function PostList() {
  const { data: posts, mutate } = useSWR('/api/posts', fetcher);
  const { mutate: globalMutate } = useSWRConfig();

  async function handleDelete(id: string) {
    // Optimistically remove from UI
    await mutate(
      posts?.filter(p => p.id !== id),
      { revalidate: false }
    );
    // Then call the real API
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    // Revalidate to sync server state
    mutate();
  }

  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>
          {post.title}
          <button onClick={() => handleDelete(post.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

## Middleware-Level Auth Guard

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/private/:path*'],
};
```

## Fetching with Authentication Headers

```ts
// lib/api.ts
import { cookies } from 'next/headers';

export async function authFetch(url: string, options?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',                     // user-specific — never cache
  });

  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```