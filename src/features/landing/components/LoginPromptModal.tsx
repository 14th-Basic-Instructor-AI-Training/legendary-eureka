"use client";

import { useTranslation } from "react-i18next";
import { Login } from "iconsax-reactjs";
import { Button, Modal } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";

/**
 * Login-prompt modal — shown when a guest taps an authenticated-only hero CTA
 * (e.g. "Plan a trip"). Soft prompt instead of a hard redirect: travelers reach
 * the action directly; everyone else gets this. "Log in" routes to /login.
 */
export function LoginPromptModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  const goToLogin = () => {
    onClose();
    router.push("/login");
  };

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
              <Modal.Icon className="text-primary">
                <Login size={20} color="currentColor" variant="Bold" />
              </Modal.Icon>
              <Modal.Heading>{t("landing.loginPrompt.title")}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">
                {t("landing.loginPrompt.body")}
              </p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button type="button" variant="tertiary" onPress={onClose}>
                {t("landing.loginPrompt.cancel")}
              </Button>
              <Button type="button" variant="primary" onPress={goToLogin}>
                {t("landing.loginPrompt.login")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
