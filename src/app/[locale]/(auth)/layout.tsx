import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FloatingParticlesWrapper } from "@/features/auth/components/FloatingParticlesWrapper";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-surface to-background relative min-h-dvh bg-gradient-to-b">
      <FloatingParticlesWrapper />
      <AuthHeader />
      <main className="relative z-10 flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
