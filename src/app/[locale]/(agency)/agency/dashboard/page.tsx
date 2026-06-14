import { Map, MapPin, Clock, Star, Plus, Layers, type LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ── Mock data ──────────────────────────────────────────── */
const BOOKINGS = [
  { id: 1, traveler: 'Maria Santos',  initials: 'MS', pkg: '7-Day Bali Retreat',    date: 'Jun 12, 2026', status: 'pending'  },
  { id: 2, traveler: 'James Kim',     initials: 'JK', pkg: 'Angkor Wat Explorer',    date: 'Jun 10, 2026', status: 'approved' },
  { id: 3, traveler: 'Priya Nair',    initials: 'PN', pkg: 'Mekong River Journey',   date: 'Jun 09, 2026', status: 'approved' },
  { id: 4, traveler: 'Lucas Dupont',  initials: 'LD', pkg: 'Siem Reap Highlights',   date: 'Jun 08, 2026', status: 'rejected' },
  { id: 5, traveler: 'Aisha Hassan',  initials: 'AH', pkg: 'Phnom Penh City Tour',   date: 'Jun 07, 2026', status: 'pending'  },
  { id: 6, traveler: 'Mohammed Ali',  initials: 'MA', pkg: 'Phnom Penh City Tour',   date: 'Jun 07, 2026', status: 'pending'  }
] as const;

const REVIEWS = [
  { id: 1, traveler: 'Sarah Lim',     initials: 'SL', rating: 5, comment: 'Absolutely breathtaking. Our guide was knowledgeable and the itinerary was perfectly paced.' },
  { id: 2, traveler: 'Tom Weber',     initials: 'TW', rating: 4, comment: 'Great overall trip. The accommodations were comfortable and the food exceeded expectations.' },
  { id: 3, traveler: 'Yuki Tanaka',   initials: 'YT', rating: 5, comment: 'Exceeded all expectations! Would definitely book again with this agency without hesitation.' },
];

type BookingStatus = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<BookingStatus, { badge: string; dot: string; label: string }> = {
  pending:  { badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400',   label: 'Pending'  },
  approved: { badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Approved' },
  rejected: { badge: 'bg-red-100 text-red-800',         dot: 'bg-red-500',     label: 'Rejected' },
};

// Deterministic avatar color per initials pair
const AVATAR_PALETTES = [
  { bg: '#EBF2FC', color: '#185FA5' },
  { bg: '#CCFBF1', color: '#0D9488' },
  { bg: '#F3E8FF', color: '#7E22CE' },
  { bg: '#FFF0E0', color: '#C2410C' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#D1FAE5', color: '#065F46' },
];

/* ── Sub-components ─────────────────────────────────────── */

function TravelerAvatar({ initials }: { initials: string }) {
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) ?? 0)) % AVATAR_PALETTES.length;
  const { bg, color } = AVATAR_PALETTES[idx];
  return (
    <Avatar className="size-7 shrink-0">
      <AvatarFallback className="text-[9.5px] font-bold" style={{ background: bg, color }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const { badge, dot, label } = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap', badge)}>
      <span className={cn('size-[5px] shrink-0 rounded-full', dot)} />
      {label}
    </span>
  );
}

function StarRating({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= value ? '#FFA827' : '#E1E6EC' }}>★</span>
      ))}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconStyle?: React.CSSProperties;
  sub?: string;
  urgent?: boolean;
}

function StatCard({ label, value, icon: Icon, iconStyle, sub, urgent }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5',
      urgent ? 'border-amber-400 bg-amber-50' : 'border-agency-border bg-white',
    )}>
      <div className="mb-3.5 flex items-start justify-between gap-2">
        <span className={cn(
          'max-w-[120px] text-xs font-semibold leading-snug',
          urgent ? 'text-amber-900' : 'text-agency-muted',
        )}>
          {label}
        </span>
        <div
          className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px]"
          style={urgent ? { background: '#FEF3C7', color: '#D97706' } : iconStyle}
        >
          <Icon size={16} strokeWidth={1.75} />
        </div>
      </div>

      <p className={cn(
        'text-[34px] font-extrabold leading-none tracking-tight',
        urgent ? 'text-amber-600' : 'text-agency-navy',
      )}>
        {value}
      </p>

      {sub && (
        <p className={cn(
          'mt-2 flex items-center gap-1 text-[11px] font-semibold',
          urgent ? 'text-amber-700' : 'text-agency-muted',
        )}>
          {urgent && <span className="inline-block size-1.5 shrink-0 rounded-full bg-amber-400" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function RecentBookings() {
  return (
    <div className="min-w-0 overflow-hidden rounded-[14px] border border-agency-border bg-white" style={{ flex: '1.25' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-agency-border px-5 py-4">
        <h2 className="text-[15px] font-bold tracking-tight text-agency-navy">Recent Bookings</h2>
        <span className="cursor-pointer text-xs font-semibold text-agency hover:underline">View All</span>
      </div>

      {/* Column headers */}
      <div
        className="grid items-center gap-x-4 bg-surface px-5 py-2"
        style={{ gridTemplateColumns: '1.8fr 1.8fr 1fr auto' }}
      >
        {['Traveler', 'Package', 'Date', 'Status'].map((h) => (
          <span key={h} className="text-[10.5px] font-bold uppercase tracking-widest text-agency-muted">{h}</span>
        ))}
      </div>

      {/* Rows */}
      {BOOKINGS.map((b, i) => (
        <div
          key={b.id}
          className={cn('grid items-center gap-x-4 px-5 py-2.75', i > 0 && 'border-t border-agency-border')}
          style={{ gridTemplateColumns: '1.8fr 1.8fr 1fr auto' }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <TravelerAvatar initials={b.initials} />
            <span className="truncate text-[13px] font-semibold text-agency-dark">{b.traveler}</span>
          </div>
          <span className="truncate text-[12.5px] text-agency-muted">{b.pkg}</span>
          <span className="whitespace-nowrap text-xs text-agency-muted">{b.date}</span>
          <StatusBadge status={b.status} />
        </div>
      ))}
    </div>
  );
}

function RecentReviews() {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-[14px] border border-agency-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-agency-border px-5 py-4">
        <h2 className="text-[15px] font-bold tracking-tight text-agency-navy">Recent Reviews</h2>
        <div className="flex items-center gap-1.5">
          <StarRating value={5} size={11} />
          <span className="text-xs font-bold text-agency-dark">4.6</span>
        </div>
      </div>

      {/* Review items */}
      {REVIEWS.map((r, i) => (
        <div key={r.id} className={cn('px-5 py-3.25', i > 0 && 'border-t border-agency-border')}>
          <div className="mb-1.5 flex items-center gap-2.5">
            <TravelerAvatar initials={r.initials} />
            <div>
              <p className="text-[12.5px] font-bold leading-tight text-agency-dark">{r.traveler}</p>
              <StarRating value={r.rating} size={11} />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-agency-muted">
            &ldquo;{r.comment}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}

function QuickActions() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-agency-border bg-white px-6 py-5">
      <div>
        <h2 className="mb-1 text-[15px] font-bold tracking-tight text-agency-navy">Quick Actions</h2>
        <p className="text-[12.5px] leading-relaxed text-agency-muted">
          Create and publish content to attract more travelers to your packages.
        </p>
      </div>
      <div className="flex shrink-0 gap-2.5">
        <Button
          variant="outline"
          className="h-auto gap-1.5 rounded-full border-agency px-4.5 py-2.25 text-[13px] text-agency hover:bg-agency-light hover:border-agency"
        >
          <Plus size={15} strokeWidth={1.75} data-icon="inline-start" />
          Create Activity
        </Button>
        <Button
          className="h-auto gap-1.5 rounded-full bg-agency px-4.5 py-2.25 text-[13px] text-white hover:bg-agency/90"
        >
          <Layers size={15} strokeWidth={1.75} data-icon="inline-start" />
          Create Package
        </Button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="px-7 py-7 pb-12">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-agency-navy">
          Dashboard
        </h1>
        <p className="mt-px text-[12.5px] text-agency-muted">Saturday, June 14, 2026</p>
      </div>

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <StatCard
          label="Total Tour Packages"
          value={24}
          icon={Map}
          iconStyle={{ background: '#EBF2FC', color: '#185FA5' }}
          sub="8 currently active"
        />
        <StatCard
          label="Pending Booking Requests"
          value={8}
          icon={Clock}
          urgent
          sub="8 awaiting review"
        />
        <StatCard
          label="Total Activities"
          value={47}
          icon={MapPin}
          iconStyle={{ background: '#CCFBF1', color: '#1CA1A7' }}
          sub="Across 12 categories"
        />
        <StatCard
          label="Average Rating"
          value="4.6★"
          icon={Star}
          iconStyle={{ background: '#FFF4E0', color: '#FFA827' }}
          sub="Based on 84 reviews"
        />
      </div>

      {/* Middle zone */}
      <div className="mb-4 flex items-start gap-4">
        <RecentBookings />
        <RecentReviews />
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}
