"use client";

import { useTranslation } from "react-i18next";
import { Clock } from "iconsax-reactjs";
import { Button, Modal } from "@/ui";

/**
 * Shown when a Tour Agency whose registration is still awaiting admin approval
 * taps the "Workspace" button in the marketing header. Their account exists with
 * the `agency` role but the agency profile is still `PENDING`, so the workspace
 * isn't usable yet — this explains why instead of dropping them into a dead area.
 */
export function AgencyApprovalPendingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
              <Modal.Icon className="text-warning">
                <Clock size={20} color="currentColor" variant="Bold" />
              </Modal.Icon>
              <Modal.Heading>{t("landing.agencyPending.title")}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">
                {t("landing.agencyPending.body")}
              </p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button type="button" variant="primary" onPress={onClose}>
                {t("landing.agencyPending.gotIt")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
