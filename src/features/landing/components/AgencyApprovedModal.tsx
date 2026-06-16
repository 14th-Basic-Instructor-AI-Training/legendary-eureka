"use client";

import { useTranslation } from "react-i18next";
import { TickCircle } from "iconsax-reactjs";
import { Button, Modal } from "@/ui";

/**
 * Shown live (no reload) when an admin approves the signed-in agency's
 * registration — pushed over realtime and surfaced by `MarketingHeader`. The
 * counterpart to `AgencyApprovalPendingModal`: instead of explaining the wait,
 * it confirms the unlock and offers a direct jump into the workspace.
 */
export function AgencyApprovedModal({
  isOpen,
  onClose,
  onGoToWorkspace,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGoToWorkspace: () => void;
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
              <Modal.Icon className="text-green">
                <TickCircle size={20} color="currentColor" variant="Bold" />
              </Modal.Icon>
              <Modal.Heading>{t("landing.agencyApproved.title")}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">
                {t("landing.agencyApproved.body")}
              </p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button type="button" variant="tertiary" onPress={onClose}>
                {t("landing.agencyApproved.dismiss")}
              </Button>
              <Button type="button" variant="primary" onPress={onGoToWorkspace}>
                {t("landing.agencyApproved.goToWorkspace")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
