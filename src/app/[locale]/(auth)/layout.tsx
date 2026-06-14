import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="from-surface to-background relative flex min-h-dvh items-center justify-center bg-gradient-to-b px-4 py-10">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      {children}
    </main>
  );
}
