# Component Types — Extended Reference

## Decision Guide: Server vs Client

```
Does the component need any of these?
  useState / useReducer / useRef
  useEffect / useLayoutEffect
  onClick / onChange / onSubmit (event handlers)
  Browser APIs (window, document, localStorage)
  Third-party client-only libraries (charts, maps, drag-drop)
  → YES → 'use client'
  → NO  → Server Component (no directive needed)
```

Keep 'use client' as deep in the tree as possible.
A Server Component can import and render Client Components,
but a Client Component cannot import Server Components.

---

## Form Component (with Server Action)

```tsx
// components/contact-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContact } from '@/app/actions/contact';

interface FormState {
  error: string | null;
  success: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white
                 disabled:opacity-50 hover:bg-blue-700"
    >
      {pending ? 'Sending…' : 'Send Message'}
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<FormState, FormData>(
    submitContact,
    { error: null, success: false }
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border px-3 py-2 text-sm
                     focus-visible:outline-none focus-visible:ring-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full rounded-md border px-3 py-2 text-sm
                     focus-visible:outline-none focus-visible:ring-2"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-600">Message sent!</p>
      )}
      <SubmitButton />
    </form>
  );
}
```

---

## Layout Component

```tsx
// app/(marketing)/layout.tsx
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
    </>
  );
}
```

---

## Loading & Error UI

```tsx
// app/posts/loading.tsx  (auto-used by Next.js as Suspense fallback)
export default function PostsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-9 w-32 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// app/posts/error.tsx
'use client';

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-lg font-medium">Something went wrong.</p>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## Modal (Client Component with Portal)

```tsx
// components/modal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-xl p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </dialog>,
    document.body
  );
}
```

---

## Data Table (Server Component)

```tsx
// components/data-table.tsx
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  caption,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        {caption && (
          <caption className="pb-2 text-left text-gray-500">{caption}</caption>
        )}
        <thead className="border-b bg-gray-50">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-medium text-gray-700"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map(col => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-600">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Compound Component Pattern

```tsx
// components/card.tsx — Server Component, composable parts
interface CardProps { children: React.ReactNode; className?: string }

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b px-5 py-4 font-semibold">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t px-5 py-3 text-sm text-gray-500">{children}</div>;
};
```

Usage:
```tsx
<Card>
  <Card.Header>Revenue</Card.Header>
  <Card.Body><RevenueChart /></Card.Body>
  <Card.Footer>Updated 5 min ago</Card.Footer>
</Card>
```