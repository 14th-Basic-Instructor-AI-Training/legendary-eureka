"use client";

import type { ReactNode } from "react";
import { create } from "zustand";
import { ConfirmDialog, type ConfirmIntent } from "./ConfirmDialog";

/**
 * Imperative confirmation: one mounted modal, dynamic content per call.
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title, description, intent: "danger" });
 *   if (ok) deleteThing();
 *
 * Or let the dialog own the async + loading state by passing `onConfirm`:
 *
 *   await confirm({ title, intent: "primary", onConfirm: () => api.confirmBooking(id) });
 *
 * `confirm()` resolves `true` once confirmed (after `onConfirm` settles, if
 * given) and `false` on cancel / backdrop / Escape. A single <ConfirmRoot/> is
 * mounted in Providers, so there is exactly one modal in the tree.
 */
export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: ConfirmIntent;
  icon?: ReactNode;
  isDismissable?: boolean;
  /**
   * Optional async action run while the dialog shows a loading spinner. If it
   * rejects, the dialog stays open so the caller can surface the error.
   */
  onConfirm?: () => void | Promise<void>;
};

type ConfirmStore = {
  isOpen: boolean;
  isLoading: boolean;
  options: ConfirmOptions | null;
  resolver: ((confirmed: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
};

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  isLoading: false,
  options: null,
  resolver: null,

  confirm: (options) => {
    // If a previous confirm is still open, resolve it as cancelled first.
    get().resolver?.(false);
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, isLoading: false, options, resolver: resolve });
    });
  },

  handleConfirm: async () => {
    const { options, resolver } = get();
    const action = options?.onConfirm;
    if (action) {
      set({ isLoading: true });
      try {
        await action();
      } catch {
        // Keep the dialog open; the caller's action is responsible for toasting.
        set({ isLoading: false });
        return;
      }
    }
    set({ isOpen: false, isLoading: false, options: null, resolver: null });
    resolver?.(true);
  },

  handleCancel: () => {
    const { resolver } = get();
    set({ isOpen: false, isLoading: false, options: null, resolver: null });
    resolver?.(false);
  },
}));

/** Returns the imperative `confirm(options) => Promise<boolean>` function. */
export function useConfirm() {
  return useConfirmStore((s) => s.confirm);
}

/**
 * The single confirmation modal for the whole app. Mount once (in Providers);
 * every `confirm()` call renders through this instance.
 */
export function ConfirmRoot() {
  const isOpen = useConfirmStore((s) => s.isOpen);
  const isLoading = useConfirmStore((s) => s.isLoading);
  const options = useConfirmStore((s) => s.options);
  const handleConfirm = useConfirmStore((s) => s.handleConfirm);
  const handleCancel = useConfirmStore((s) => s.handleCancel);

  if (!options) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={options.title}
      description={options.description}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      intent={options.intent}
      icon={options.icon}
      isDismissable={options.isDismissable}
      isLoading={isLoading}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
