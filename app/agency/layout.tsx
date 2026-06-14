import AgencySidebar from '@/components/agency/AgencySidebar';
import AgencyNavbar from '@/components/agency/AgencyNavbar';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FB]">
      <AgencySidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AgencyNavbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
