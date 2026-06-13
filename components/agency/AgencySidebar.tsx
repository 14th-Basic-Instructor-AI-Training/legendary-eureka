'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutGrid,
  MapPin,
  Map,
  Calendar,
  Bell,
  SlidersHorizontal,
  LogOut,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import logo from '@/assets/transparent-bg-logo.png';

/* ── Design tokens ─────────────────────────────────── */
const AGENCY   = '#185FA5';
const AG_LIGHT = '#E8F0FB';
const NAVY     = '#0D233A';
const BORDER   = '#E1E6EC';
const DARK     = '#323D4D';
const WHITE    = '#FFFFFF';

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',       href: '/agency/dashboard',     Icon: LayoutGrid },
  { id: 'activities',    label: 'Activities',       href: '/agency/activities',    Icon: MapPin     },
  { id: 'packages',      label: 'Tour Packages',    href: '/agency/packages',      Icon: Map        },
  { id: 'bookings',      label: 'Bookings',         href: '/agency/bookings',      Icon: Calendar   },
  { id: 'notifications', label: 'Notifications',    href: '/agency/notifications', Icon: Bell, badge: 5 },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Profile & Settings', href: '/agency/settings', Icon: SlidersHorizontal },
];

/* ── Avatar ────────────────────────────────────────── */
function Avatar({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: AG_LIGHT,
        color: AGENCY,
        border: `1.5px solid ${AGENCY}20`,
        flexShrink: 0,
        fontSize: Math.round(size * 0.34),
        letterSpacing: '0.01em',
      }}
      className="flex items-center justify-center font-bold"
    >
      KT
    </div>
  );
}

/* ── NavLink ───────────────────────────────────────── */
function NavLink({
  label, href, Icon, badge, active, collapsed,
}: {
  label: string; href: string; Icon: LucideIcon;
  badge?: number; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '9px 0' : '8px 12px',
        borderRadius: 10,
        background: active ? AGENCY : 'transparent',
        color: active ? WHITE : DARK,
        fontWeight: active ? 600 : 500,
        fontSize: 13,
        textDecoration: 'none',
        transition: 'background 0.12s ease, color 0.12s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      className={!active ? 'hover:bg-[#E8F0FB]! hover:text-[#185FA5]!' : ''}
    >
      <span className="relative inline-flex shrink-0">
        <Icon size={17} strokeWidth={1.75} />
        {badge && collapsed && (
          <span
            style={{
              position: 'absolute', top: -5, right: -5,
              background: '#EF4444', color: WHITE,
              borderRadius: 999, minWidth: 14, height: 14,
              fontSize: 8.5, fontWeight: 800,
              padding: '0 2.5px', lineHeight: 1,
              border: `1.5px solid ${WHITE}`,
            }}
            className="flex items-center justify-center"
          >
            {badge}
          </span>
        )}
      </span>

      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span
              style={{
                background: active ? 'rgba(255,255,255,0.2)' : `${AGENCY}22`,
                color: active ? WHITE : AGENCY,
                borderRadius: 999, padding: '1px 7px',
                fontSize: 10.5, fontWeight: 700,
                minWidth: 20, textAlign: 'center',
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/* ── CollapseToggle ────────────────────────────────── */
function CollapseToggle({
  collapsed, sidebarWidth, onClick,
}: {
  collapsed: boolean; sidebarWidth: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const Chevron = collapsed ? ChevronRight : ChevronLeft;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      style={{
        position: 'absolute',
        left: sidebarWidth - 13,
        top: 22,
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: hov ? AGENCY : WHITE,
        border: `1.5px solid ${hov ? AGENCY : '#C8D0DA'}`,
        color: hov ? WHITE : DARK,
        boxShadow: '0 1px 6px rgba(13,35,58,0.13)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 0.22s ease, background 0.14s ease, border-color 0.14s ease, color 0.14s ease',
        zIndex: 20,
        padding: 0,
        outline: 'none',
        flexShrink: 0,
      }}
    >
      <Chevron size={11} strokeWidth={2.5} />
    </button>
  );
}

/* ── AgencySidebar ─────────────────────────────────── */
export default function AgencySidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on mobile on first mount
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
    // Wrapper is relative so the toggle button can straddle the right border
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <aside
        style={{
          width: w,
          minWidth: w,
          height: '100vh',
          background: WHITE,
          borderRight: `1px solid ${BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.22s ease, min-width 0.22s ease',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* ── Zone 1: Platform logo ── */}
        <div
          style={{
            padding: collapsed ? '16px 0' : '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${BORDER}`,
            minHeight: 72,
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            /* Collapsed: pin mark cropped from logo top-center */
            <div style={{ width: 36, height: 36, position: 'relative', overflow: 'hidden', borderRadius: 6, flexShrink: 0 }}>
              <Image
                src={logo}
                alt="Destination"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
                sizes="36px"
                priority
              />
            </div>
          ) : (
            /* Expanded: full logo flush-left */
            <div style={{ position: 'relative', height: 52, width: 176, flexShrink: 0 }}>
              <Image
                src={logo}
                alt="Destination"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
                sizes="176px"
                priority
              />
            </div>
          )}
        </div>

        {/* ── Zone 1b: Agency identity ── */}
        <div
          style={{
            padding: collapsed ? '12px 0' : '11px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            borderBottom: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}
        >
          <Avatar size={collapsed ? 32 : 34} />
          {!collapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Khmer Tours Co.
              </div>
              <div style={{ fontSize: 11, color: AGENCY, fontWeight: 600, marginTop: 1, letterSpacing: '0.02em' }}>
                Tour Agency
              </div>
            </div>
          )}
        </div>

        {/* ── Zone 2: Main nav ── */}
        <nav
          style={{
            flex: 1,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              href={item.href}
              Icon={item.Icon}
              badge={item.badge}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* ── Zone 3: Bottom actions ── */}
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
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
          <button
            title={collapsed ? 'Log Out' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '9px 0' : '8px 12px',
              borderRadius: 10,
              color: DARK,
              fontWeight: 500,
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.12s ease, color 0.12s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            className="hover:bg-[#E8F0FB]! hover:text-[#185FA5]!"
          >
            <LogOut size={17} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Collapse toggle — straddles the right border, aligned with logo zone ── */}
      <CollapseToggle
        collapsed={collapsed}
        sidebarWidth={w}
        onClick={() => setCollapsed((c) => !c)}
      />
    </div>
  );
}
