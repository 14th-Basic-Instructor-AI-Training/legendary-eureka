"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Trash, Warning2, TickCircle } from "iconsax-reactjs";
import { Modal } from "@heroui/react";
import { Button } from "./Button";
import { Spinner } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Jalat ConfirmDialog — the single, reusable confirmation modal.
 *
 * One modal, dynamic content: drive it imperatively with `useConfirm()` (see
 * `useConfirm.tsx`) for actions that must be confirmed first — delete, logout,
 * confirm booking, and the like. The `intent` picks the accent colour, default
 * icon, and confirm-button style; everything else (title/description/labels) is
 * passed per call. This component is presentational + controlled — it never owns
 * its own open state.
 */
export type ConfirmIntent = "danger" | "warning" | "primary";

export type ConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Defaults to `common.confirm`. */
  confirmLabel?: string;
  /** Defaults to `common.cancel`. */
  cancelLabel?: string;
  /** Accent + default icon + confirm-button style. Defaults to `primary`. */
  intent?: ConfirmIntent;
  /** Override the default icon for the intent. */
  icon?: ReactNode;
  /** Disables buttons and shows a spinner on confirm (async actions). */
  isLoading?: boolean;
  /** Allow closing by backdrop click / Escape. Defaults to true. */
  isDismissable?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

/** Accent classes for the header icon badge, keyed by intent. */
const INTENT_BADGE: Record<ConfirmIntent, string> = {
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
};

/** Default icon per intent (overridable via the `icon` prop). */
function DefaultIcon({ intent }: { intent: ConfirmIntent }) {
  if (intent === "danger") return <Trash size={20} color="currentColor" />;
  if (intent === "warning") return <Warning2 size={20} color="currentColor" />;
  return <TickCircle size={20} color="currentColor" />;
}

/** The confirm button variant per intent (`danger` is destructive). */
const INTENT_CONFIRM_VARIANT: Record<ConfirmIntent, "danger" | "primary"> = {
  danger: "danger",
  warning: "primary",
  primary: "primary",
};

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  intent = "primary",
  icon,
  isLoading = false,
  isDismissable = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const handleOpenChange = (open: boolean) => {
    // Closing via backdrop / Escape is treated as a cancel.
    if (!open && !isLoading) onCancel?.();
    if (!isLoading) onOpenChange(open);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop isDismissable={isDismissable && !isLoading}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            {isDismissable && !isLoading ? <Modal.CloseTrigger /> : null}
            <Modal.Header>
              <Modal.Icon className={cn(INTENT_BADGE[intent])}>
                {icon ?? <DefaultIcon intent={intent} />}
              </Modal.Icon>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            {description ? (
              <Modal.Body>
                <div className="text-muted text-sm">{description}</div>
              </Modal.Body>
            ) : null}
            <Modal.Footer>
              <Button variant="secondary" isDisabled={isLoading} onPress={() => handleOpenChange(false)}>
                {cancelLabel ?? t("common.cancel")}
              </Button>
              <Button
                variant={INTENT_CONFIRM_VARIANT[intent]}
                isDisabled={isLoading}
                onPress={onConfirm}
              >
                {isLoading ? <Spinner size="sm" /> : null}
                {confirmLabel ?? t("common.confirm")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
