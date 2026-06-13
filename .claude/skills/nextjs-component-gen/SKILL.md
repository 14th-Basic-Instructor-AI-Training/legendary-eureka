---
name: nextjs-component-gen
description: >
  Generates well-structured Next.js App Router components. Use this skill
  whenever the user asks to create, scaffold, or build any kind of component,
  page, layout, modal, form, card, list, or UI element in a Next.js project.
  Trigger even for vague requests like "make a component for X", "build a
  page that shows Y", "I need a Z component", or "write the UI for this".
  Always apply this skill when generating Next.js component code.
---

# Next.js Component Generation

## Step 1 — Classify the Component

Before writing any code, decide which type the component is:

| Type | Use when | Directive |
|---|---|---|
| **Server Component** | Fetches data, no browser APIs, no interactivity | *(none — default)* |
| **Client Component** | useState, useEffect, event handlers, browser APIs | `'use client'` at top |
| **Server + Client split** | Needs both data and interactivity | Split into two files |

**Default to Server Components.** Only add `'use client'` when the component actually needs it.

Read `references/component-types.md` for the full decision guide and edge cases.

---

## Step 2 — Apply These Rules Always

### Naming & files
- One component per file; filename matches the component name in kebab-case.
- Pages → `app/.../page.tsx` | Layouts → `app/.../layout.tsx` | Components → `components/...`
- Use named exports for components (`export function`, not `export default function`) except for `page.tsx` and `layout.tsx` which require default exports.

### TypeScript
- Always define prop types inline with an `interface` above the component.
- Never use `any`. Use `unknown` + type narrowing when the shape is uncertain.
- For async server components, the return type is `Promise<JSX.Element>` — but you can omit it; TypeScript infers it.

### Styling
- Use Tailwind utility classes directly on JSX elements.
- Avoid inline `style={{}}` except for truly dynamic values (e.g. a width computed from JS).
- Group classes: layout → spacing → color → typography → state.

### Accessibility
- Semantic HTML first: `<button>` not `<div onClick>`, `<nav>` not `<div>`, etc.
- Every `<img>` needs an `alt` attribute. Use `next/image` instead of `<img>`.
- Interactive elements need visible focus styles (`focus-visible:ring-2`).
- Use `aria-label` when the element has no visible text.

---

## Step 3 — Component Templates

### Server Component (data-fetching page)

```tsx
// app/posts/page.tsx
import { PostCard } from '@/components/post-card';

interface Post {
  id: string;
  title: string;
  excerpt: string;
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Posts</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {posts.map(post => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Client Component (interactive)

```tsx
// components/counter.tsx
'use client';

import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  label?: string;
}

export function Counter({ initialCount = 0, label = 'Count' }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="flex items-center gap-3">
      <button
        aria-label="Decrement"
        className="rounded-md bg-gray-100 px-3 py-1 hover:bg-gray-200 focus-visible:ring-2"
        onClick={() => setCount(c => c - 1)}
      >
        −
      </button>
      <span className="min-w-8 text-center font-mono text-lg">
        {count}
      </span>
      <button
        aria-label="Increment"
        className="rounded-md bg-gray-100 px-3 py-1 hover:bg-gray-200 focus-visible:ring-2"
        onClick={() => setCount(c => c + 1)}
      >
        +
      </button>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}
```

### Server + Client split

```
// Server shell (no 'use client' — can fetch data)
// components/post-detail.tsx
import { LikeButton } from './like-button';   // client leaf

interface PostDetailProps {
  postId: string;
}

export async function PostDetail({ postId }: PostDetailProps) {
  const post = await getPost(postId);

  return (
    <article className="prose mx-auto">
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <LikeButton postId={postId} initialLikes={post.likes} />
    </article>
  );
}
```

```tsx
// Client leaf (only the interactive part)
// components/like-button.tsx
'use client';

import { useState } from 'react';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    setLiked(true);
    setLikes(l => l + 1);
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  }

  return (
    <button
      aria-pressed={liked}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition
        ${liked ? 'bg-rose-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
      disabled={liked}
      onClick={handleLike}
    >
      ♥ {likes}
    </button>
  );
}
```

For more patterns (forms, layouts, modals, loading/error UI, compound components),
read `references/component-types.md` and check the `examples/` folder.

---

## Step 4 — After Generating Code

Always provide:
1. **Imports** — list any packages the user needs to install.
2. **File path** — tell the user exactly where to put the file.
3. **Usage example** — show how to use the component in a parent.
4. **Props summary** — table of props, types, and defaults if the component is reusable.