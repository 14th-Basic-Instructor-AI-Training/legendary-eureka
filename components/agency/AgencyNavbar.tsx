'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const SAMPLE_NOTIFICATIONS = [
  { id: 1, title: 'New booking request', time: '2 minutes ago' },
  { id: 2, title: 'Booking confirmed',   time: '1 hour ago'    },
  { id: 3, title: 'Review submitted',    time: '3 hours ago'   },
];

export default function AgencyNavbar({
  agencyName = 'Khmer Tours Co.',
  notifCount = 5,
  showProfileName = false,
}: {
  agencyName?: string;
  notifCount?: number;
  showProfileName?: boolean;
}) {
  const initials = agencyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const badgeCount = Math.max(0, Math.floor(notifCount));
  const preview = SAMPLE_NOTIFICATIONS.slice(0, Math.min(badgeCount, 3));
  const remaining = badgeCount - preview.length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-1 border-b border-agency-border bg-white px-4.5">

      {/* Notification bell with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex size-9 items-center justify-center rounded-[9px] text-agency-dark outline-none transition-colors hover:bg-agency-light hover:text-agency">
          <Bell size={18} strokeWidth={1.75} />
          {badgeCount > 0 && (
            <Badge className="absolute right-1.25 top-1.25 flex size-3.75 min-w-0 items-center justify-center rounded-full bg-destructive p-0 text-[8.5px] font-extrabold leading-none text-white ring-[1.5px] ring-white">
              {badgeCount > 99 ? '99+' : badgeCount}
            </Badge>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-65 overflow-hidden rounded-xl p-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-agency-border px-3.5 py-3">
            <span className="text-[13px] font-bold text-agency-navy">Notifications</span>
            {badgeCount > 0 && (
              <Badge className="rounded-full bg-agency/10 px-2 text-[10.5px] font-bold text-agency">
                {badgeCount} new
              </Badge>
            )}
          </div>

          {/* Notification items */}
          {badgeCount > 0 ? (
            preview.map((n, i) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-none px-3.5 py-2.5',
                  i < preview.length - 1 && 'border-b border-agency-border',
                )}
              >
                <div className="mt-1 size-2 shrink-0 rounded-full bg-agency" />
                <div>
                  <p className="text-[12px] font-semibold leading-[1.4] text-agency-dark">{n.title}</p>
                  <p className="mt-0.5 text-[11px] text-agency-muted">{n.time}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="px-3.5 py-5 text-center text-[12px] text-agency-muted">
              No new notifications
            </p>
          )}

          {/* View all */}
          {remaining > 0 && (
            <>
              <DropdownMenuSeparator className="mx-0 bg-agency-border" />
              <DropdownMenuItem className="justify-center rounded-none px-3.5 py-2.25 text-[12px] font-semibold text-agency">
                View all {badgeCount} notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vertical divider */}
      <Separator orientation="vertical" className="mx-1.5 h-5.5" />

      {/* Agency profile pill */}
      <Button
        variant="ghost"
        className="h-auto gap-2 rounded-full px-2 py-1 text-agency-dark hover:bg-agency-light hover:text-agency"
      >
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-agency-light text-[9.5px] font-bold text-agency">
            {initials}
          </AvatarFallback>
        </Avatar>
        {showProfileName && (
          <span className="whitespace-nowrap text-[12.5px] font-semibold">{agencyName}</span>
        )}
        <ChevronDown size={13} strokeWidth={2} className="text-agency-muted" />
      </Button>
    </header>
  );
}
