'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutGrid, MapPin, Map, Calendar,
  SlidersHorizontal, LogOut, ChevronLeft, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import logo from '@/assets/transparent-bg-logo.png';

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',     href: '/agency/dashboard',  Icon: LayoutGrid },
  { id: 'activities', label: 'Activities',    href: '/agency/activities', Icon: MapPin     },
  { id: 'packages',   label: 'Tour Packages', href: '/agency/packages',   Icon: Map        },
  { id: 'bookings',   label: 'Bookings',      href: '/agency/bookings',   Icon: Calendar   },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Profile & Settings', href: '/agency/settings', Icon: SlidersHorizontal },
];

function NavLink({
  label, href, Icon, active, collapsed,
}: {
  label: string; href: string; Icon: LucideIcon;
  active: boolean; collapsed: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Link href={href} />}
        className={cn(
          'flex items-center rounded-[10px] text-[13px] font-medium overflow-hidden whitespace-nowrap',
          'transition-colors duration-120',
          collapsed ? 'w-full justify-center py-2.25 px-0' : 'gap-2.5 px-3 py-2',
          active
            ? 'bg-agency text-white font-semibold'
            : 'text-agency-dark hover:bg-agency-light hover:text-agency',
        )}
      >
        <Icon size={17} strokeWidth={1.75} className="shrink-0" />
        {!collapsed && <span className="flex-1">{label}</span>}
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}

function CollapseToggle({
  collapsed, sidebarWidth, onClick,
}: {
  collapsed: boolean; sidebarWidth: number; onClick: () => void;
}) {
  const Chevron = collapsed ? ChevronRight : ChevronLeft;
  return (
    <Button
      variant="outline"
      onClick={onClick}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="absolute top-5.5 z-20 size-6.5 rounded-full p-0 shadow-[0_1px_6px_rgba(13,35,58,0.13)] hover:bg-agency hover:text-white hover:border-agency"
      style={{
        left: sidebarWidth - 13,
        transition: 'left 0.22s ease, background-color 0.14s ease, border-color 0.14s ease, color 0.14s ease',
      }}
    >
      <Chevron size={11} strokeWidth={2.5} />
    </Button>
  );
}

export default function AgencySidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setCollapsed(mq.matches);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const w = collapsed ? 64 : 240;

  return (
    <div className="relative shrink-0">
      <aside
        className="sticky top-0 flex h-screen flex-col overflow-hidden border-r border-agency-border bg-white transition-[width,min-width] duration-220 ease-in-out"
        style={{ width: w, minWidth: w }}
      >
        {/* Zone 1: Platform logo */}
        <div
          className={cn(
            'flex min-h-18 shrink-0 items-center justify-center border-b border-agency-border',
            collapsed ? 'px-0 py-4' : 'px-4 py-3.5',
          )}
        >
          {collapsed ? (
            <div className="relative size-9 shrink-0 overflow-hidden rounded-[6px]">
              <Image
                src={logo} alt="Destination" fill
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
                sizes="36px" priority
              />
            </div>
          ) : (
            <div className="relative h-13 w-44 shrink-0">
              <Image
                src={logo} alt="Destination" fill
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
                sizes="176px" priority
              />
            </div>
          )}
        </div>

        {/* Zone 1b: Agency identity */}
        <div
          className={cn(
            'flex shrink-0 items-center border-b border-agency-border',
            collapsed ? 'justify-center px-0 py-3' : 'gap-2.5 px-3.5 py-2.75',
          )}
        >
          <Avatar className="size-8.5 shrink-0">
            <AvatarFallback className="bg-agency-light text-agency text-[11.5px] font-bold tracking-[0.01em]">
              KT
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-[13px] font-bold leading-[1.3] text-agency-navy">
                Khmer Tours Co.
              </p>
              <p className="mt-px text-[11px] font-semibold tracking-[0.02em] text-agency">
                Tour Agency
              </p>
            </div>
          )}
        </div>

        {/* Zone 2: Main nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              href={item.href}
              Icon={item.Icon}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Zone 3: Bottom actions */}
        <Separator />
        <div className="flex shrink-0 flex-col gap-0.5 p-2">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              href={item.href}
              Icon={item.Icon}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" />}
              className={cn(
                'w-full rounded-[10px] text-[13px] font-medium text-agency-dark hover:bg-agency-light hover:text-agency',
                collapsed ? 'justify-center px-0 py-2.25 h-auto' : 'justify-start gap-2.5 px-3 py-2 h-auto',
              )}
            >
              <LogOut size={17} strokeWidth={1.75} data-icon="inline-start" className="shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Log Out</span>}
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Log Out</TooltipContent>}
          </Tooltip>
        </div>
      </aside>

      <CollapseToggle
        collapsed={collapsed}
        sidebarWidth={w}
        onClick={() => setCollapsed((c) => !c)}
      />
    </div>
  );
}
