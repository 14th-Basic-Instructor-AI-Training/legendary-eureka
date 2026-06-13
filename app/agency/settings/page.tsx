import { SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  return <PageShell icon={SlidersHorizontal} title="Profile & Settings" description="Edit your agency profile, contact information, and account preferences." />;
}

function PageShell({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          style={{ background: '#E8F0FB', color: '#185FA5', borderRadius: 10 }}
          className="p-2.5 flex items-center justify-center"
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <h1 style={{ color: '#0D233A', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
      </div>
      <p style={{ color: '#9BA8B5', fontSize: 14 }}>{description}</p>
    </div>
  );
}
