# Example: Generated UserProfile Component

## Prompt
> "Build a user profile card component that shows an avatar, name, role, and a follow button."

---

## Output

**Type:** Server + Client split (static data display + interactive button)

**Files to create:**

---

### `components/user-profile-card.tsx` (Server Component)

```tsx
import Image from 'next/image';
import { FollowButton } from './follow-button';

interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  followerCount: number;
}

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm">
      <Image
        src={user.avatarUrl}
        alt={`${user.name}'s avatar`}
        width={56}
        height={56}
        className="rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-gray-900">{user.name}</p>
        <p className="truncate text-sm text-gray-500">{user.role}</p>
      </div>
      <FollowButton userId={user.id} followerCount={user.followerCount} />
    </div>
  );
}
```

---

### `components/follow-button.tsx` (Client Component)

```tsx
'use client';

import { useState } from 'react';

interface FollowButtonProps {
  userId: string;
  followerCount: number;
}

export function FollowButton({ userId, followerCount }: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(followerCount);

  async function handleFollow() {
    setFollowing(f => !f);
    setCount(c => (following ? c - 1 : c + 1));
    await fetch(`/api/users/${userId}/follow`, {
      method: following ? 'DELETE' : 'POST',
    });
  }

  return (
    <button
      aria-pressed={following}
      onClick={handleFollow}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition
        ${following
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'}
        focus-visible:ring-2`}
    >
      {following ? 'Following' : 'Follow'} · {count}
    </button>
  );
}
```

---

## Usage

```tsx
// app/team/page.tsx
import { UserProfileCard } from '@/components/user-profile-card';

export default async function TeamPage() {
  const users = await getTeamMembers();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map(user => (
        <UserProfileCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `user.id` | `string` | ✓ | Unique user identifier |
| `user.name` | `string` | ✓ | Display name |
| `user.role` | `string` | ✓ | Job title or role |
| `user.avatarUrl` | `string` | ✓ | URL for avatar image |
| `user.followerCount` | `number` | ✓ | Initial follower count |

## Packages needed
No additional packages — uses `next/image` (built-in).