"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { useTranslation } from "react-i18next";
import { SidebarLeft } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "./use-mobile";
import { Sheet, SheetContent } from "./sheet";

/**
 * shadcn-style sidebar primitives (Radix-based), scoped to this folder per
 * project convention. Reuses Jalat theme tokens (bg-surface / border-border /
 * primary) instead of a parallel --sidebar-* var set. Desktop collapses to an
 * icon rail; mobile becomes an off-canvas sheet. State persists in a cookie and
 * toggles with ⌘B / Ctrl-B.
 */

type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  open: boolean;
  setOpen: (value: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (value: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}

const SIDEBAR_COOKIE = "sidebar_state";

function readSidebarCookie(): boolean | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]+)/);
  return match ? match[1] === "true" : null;
}

function writeSidebarCookie(open: boolean): void {
  document.cookie = `${SIDEBAR_COOKIE}=${open}; path=/; max-age=31536000; samesite=lax`;
}

export function SidebarProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [open, setOpenState] = useState<boolean>(() => readSidebarCookie() ?? true);

  const setOpen = useCallback((value: boolean) => {
    setOpenState(value);
    writeSidebarCookie(value);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className={cn("flex h-dvh w-full overflow-hidden", className)}>{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent title={t("nav.toggleSidebar")} className="p-0">
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-state={state}
      className={cn(
        "group hidden h-dvh shrink-0 flex-col bg-[var(--bg-dashboard)] p-2 transition-[width] duration-200 ease-in-out md:flex",
        state === "expanded" ? "w-64" : "w-[3.75rem]",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={t("nav.toggleSidebar")}
      className={cn(
        "text-muted hover:text-foreground hover:bg-muted/10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        className,
      )}
    >
      <SidebarLeft size={20} color="currentColor" />
    </button>
  );
}

export function SidebarInset({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex min-w-0 flex-1 flex-col", className)}>{children}</div>;
}

export function SidebarHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2 p-2", className)}>{children}</div>;
}

export function SidebarContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2", className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border-border flex flex-col gap-2 border-t p-2", className)}>{children}</div>;
}

export function SidebarMenu({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("flex flex-col gap-1", className)}>{children}</ul>;
}

export function SidebarMenuItem({ children, className }: { children: ReactNode; className?: string }) {
  return <li className={cn("relative", className)}>{children}</li>;
}

type SidebarMenuButtonProps = ComponentProps<"button"> & {
  asChild?: boolean;
  active?: boolean;
};

export function SidebarMenuButton({
  asChild = false,
  active = false,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-active={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
        "group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted hover:bg-muted/10 hover:text-foreground",
        className,
      )}
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
    />
  );
}

/** Label text that hides when the desktop sidebar is collapsed to its icon rail. */
export function SidebarLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("truncate group-data-[state=collapsed]:hidden", className)}>{children}</span>
  );
}
