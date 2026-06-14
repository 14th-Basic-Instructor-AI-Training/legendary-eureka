"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { Input, type UIInputProps } from "./Input";
import { cn } from "@/lib/utils";

export type UIPasswordInputProps = Omit<UIInputProps, "type">;

/**
 * Password field with a show/hide eye toggle. Drop-in replacement for
 * `<Input type="password" />` — forwards all Input props (value/onChange/id/…).
 * The toggle is not in the tab order (tabIndex -1) so keyboard flow stays on the
 * field; the eye icon flips between open (hidden) and closed (visible).
 */
export function PasswordInput({ className, ...props }: UIPasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
        aria-pressed={visible}
        className="text-muted hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
      >
        {visible ? (
          <EyeSlash size={18} color="currentColor" />
        ) : (
          <Eye size={18} color="currentColor" />
        )}
      </button>
    </div>
  );
}
