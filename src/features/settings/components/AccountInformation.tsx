"use client";

import { useState, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DocumentUpload, Sms, Edit2 } from "iconsax-reactjs";
import { Button, Input, Select, ListBox } from "@/ui";

/** Countries offered in the account country select (labels are localized). */
const COUNTRY_CODES = ["us", "kh", "kr", "jp", "th", "vn"] as const;

/** Label column + field column row with a top divider, matching the design. */
function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-border grid grid-cols-1 gap-3 border-t py-5 sm:grid-cols-[200px_1fr] sm:gap-6">
      <div>
        <p className="text-foreground text-sm font-medium">{label}</p>
        {hint ? <p className="text-muted mt-0.5 text-xs">{hint}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

/** Traveler/admin account details panel (static UI). */
export function AccountInformation() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("Emmanuel");
  const [lastName, setLastName] = useState("Ackers");
  const [email, setEmail] = useState("emmanuel@email.com");
  const [phone, setPhone] = useState("1234 567 890");
  const [country, setCountry] = useState<string>("us");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 pb-5">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            {t("settings.account.title")}
          </h2>
          <p className="text-muted mt-1 text-sm">{t("settings.account.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            {t("settings.account.cancel")}
          </Button>
          <Button variant="primary" size="sm">
            {t("settings.account.save")}
          </Button>
        </div>
      </header>

      <FieldRow label={t("settings.account.photoLabel")} hint={t("settings.account.photoHint")}>
        <div className="max-w-md">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhotoPreview(URL.createObjectURL(file));
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="border-border hover:border-primary/40 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview ? (
              <img src={photoPreview} className="h-16 w-16 rounded-full object-cover" alt="preview" />
            ) : (
              <>
                <span className="bg-muted/10 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <DocumentUpload size={20} color="currentColor" className="text-muted" />
                </span>
                <span className="text-sm">
                  <span className="text-primary font-semibold">{t("settings.account.uploadCta")}</span>{" "}
                  <span className="text-muted">{t("settings.account.uploadRest")}</span>
                </span>
                <span className="text-muted text-xs">{t("settings.account.uploadFormats")}</span>
              </>
            )}
          </button>
        </div>
      </FieldRow>

      <FieldRow label={t("settings.account.name")}>
        <div className="grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-first" className="text-muted mb-1 block text-xs">
              {t("settings.account.firstName")}
            </label>
            <Input
              id="acc-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-label={t("settings.account.firstName")}
            />
          </div>
          <div>
            <label htmlFor="acc-last" className="text-muted mb-1 block text-xs">
              {t("settings.account.lastName")}
            </label>
            <Input
              id="acc-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-label={t("settings.account.lastName")}
            />
          </div>
        </div>
      </FieldRow>

      <FieldRow label={t("settings.account.email")}>
        <div className="relative max-w-md">
          <Sms
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label={t("settings.account.email")}
            className="pl-9"
          />
        </div>
        <p className="text-warning mt-1.5 text-xs">{t("settings.account.emailUnverified")}</p>
        <button type="button" className="text-primary mt-0.5 text-xs font-semibold">
          {t("settings.account.verifyNow")}
        </button>
      </FieldRow>

      <FieldRow label={t("settings.account.phone")}>
        <div className="border-border flex max-w-md items-center gap-2 rounded-xl border px-3 py-2">
          <span className="text-muted shrink-0 text-sm">+880</span>
          <span className="bg-border h-5 w-px" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label={t("settings.account.phone")}
            className="text-foreground w-full bg-transparent text-sm outline-none"
          />
          <Edit2 size={16} color="currentColor" className="text-muted shrink-0" />
        </div>
      </FieldRow>

      <FieldRow label={t("settings.account.country")}>
        <Select
          aria-label={t("settings.account.country")}
          selectedKey={country}
          onSelectionChange={(key) => key !== null && setCountry(key as string)}
          className="max-w-md"
        >
          <Select.Trigger>
            <Select.Value>{() => t(`settings.account.countries.${country}`)}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {COUNTRY_CODES.map((c) => (
                <ListBox.Item key={c} id={c} textValue={t(`settings.account.countries.${c}`)}>
                  {t(`settings.account.countries.${c}`)}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FieldRow>
    </div>
  );
}
