"use client";

import { useTranslation } from "react-i18next";
import { Warning2 } from "iconsax-reactjs";
import { Button, Modal } from "@/ui";

/**
 * Reusable confirmation dialog for destructive/irreversible traveler actions
 * (cancel booking, delete review, delete account). Built on the wrapped Modal
 * so it shares the app's modal styling. Copy is passed in already localized.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  destructive = true,
  isPending = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  isPending?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className={destructive ? "text-danger" : "text-primary"}>
                <Warning2 size={20} color="currentColor" />
              </Modal.Icon>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button type="button" variant="tertiary" onPress={onClose}>
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="primary"
                className={destructive ? "bg-danger hover:bg-danger/90" : undefined}
                isPending={isPending}
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
