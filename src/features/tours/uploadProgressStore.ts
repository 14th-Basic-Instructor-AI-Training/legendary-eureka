import { create } from "zustand";

/**
 * The destination create/edit upload pipeline, step by step. Lives in a global
 * store so the animated content can be handed to Sileo as a toast `description`
 * (rendered in Sileo's own tree) while the form drives the progress from afar —
 * Sileo has no `update()` API, so the live state flows through here instead.
 */
export type UploadPhase =
  | { step: "cover"; percent: number }
  | { step: "photos"; percent: number }
  | { step: "create" }
  | { step: "done"; name: string }
  | { step: "error"; message: string };

type UploadProgressState = {
  phase: UploadPhase | null;
  isEditing: boolean;
  setPhase: (phase: UploadPhase | null) => void;
  setEditing: (isEditing: boolean) => void;
};

export const useUploadProgressStore = create<UploadProgressState>((set) => ({
  phase: null,
  isEditing: false,
  setPhase: (phase) => set({ phase }),
  setEditing: (isEditing) => set({ isEditing }),
}));
