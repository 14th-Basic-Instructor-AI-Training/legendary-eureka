"use client";

import { useTranslation } from "react-i18next";
import { CloseCircle } from "iconsax-reactjs";
import { Button, Modal } from "@/ui";

/**
 * Shown when an admin rejects the signed-in agency's registration. Rejection
 * downgrades the account to a plain Traveler on the backend; the user's session
 * still carries the old `agency` role until it re-authenticates, so the primary
 * action signs out and sends them to log in again as a Traveler.
 */
export function AgencyRejectedModal({
  isOpen,
  onClose,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
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
              <Modal.Icon className="text-danger">
                <CloseCircle size={20} color="currentColor" variant="Bold" />
              </Modal.Icon>
              <Modal.Heading>{t("landing.agencyRejected.title")}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">
                {t("landing.agencyRejected.body")}
              </p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button type="button" variant="primary" onPress={onContinue}>
                {t("landing.agencyRejected.continue")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
