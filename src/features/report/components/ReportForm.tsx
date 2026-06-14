"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { DocumentUpload, Trash } from "iconsax-reactjs";
import { Button, Form, Label, TextArea } from "@/ui";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { submitReport } from "../data";
import {
  ReportFormSchema,
  ReportReasonSchema,
  REPORT_MAX_DESCRIPTION,
  REPORT_MAX_EVIDENCE,
  type ReportFormValues,
} from "../schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger text-sm" role="alert">
      {message}
    </p>
  );
}

/** Report form: reason radio cards + description + optional evidence. RHF + Zod. */
export function ReportForm({
  agencyId,
  onSubmitted,
}: {
  agencyId: string;
  onSubmitted: () => void;
}) {
  const { t } = useTranslation();
  const { role } = useSession();
  const router = useLocalizedRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: { reason: undefined, description: "", evidence: [] },
  });

  const description = useWatch({ control, name: "description" }) ?? "";

  const onSubmit = async (values: ReportFormValues) => {
    const res = await submitReport(
      role,
      agencyId,
      ReportFormSchema.parse(values),
    );
    if (res.ok) onSubmitted();
  };

  return (
    <Form
      className="flex flex-col gap-6"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Reason */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-foreground mb-1 text-sm font-semibold">
          {t("report.reasonLegend")}
        </legend>
        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <>
              {ReportReasonSchema.options.map((reason) => {
                const selected = field.value === reason;
                return (
                  <label
                    key={reason}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      selected
                        ? "border-primary-lightskyblue bg-primary-lightskyblue/8"
                        : "border-border hover:border-primary-lightskyblue/50",
                    )}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={reason}
                      checked={selected}
                      onChange={() => field.onChange(reason)}
                      onBlur={field.onBlur}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        selected
                          ? "border-primary-lightskyblue"
                          : "border-border",
                      )}
                    >
                      {selected ? (
                        <span className="bg-primary-lightskyblue h-2.5 w-2.5 rounded-full" />
                      ) : null}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-foreground text-sm font-semibold">
                        {t(`report.reasons.${reason}.label`)}
                      </span>
                      <span className="text-muted text-xs">
                        {t(`report.reasons.${reason}.desc`)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </>
          )}
        />
        <FieldError
          message={
            errors.reason?.message ? t("report.errors.reason") : undefined
          }
        />
      </fieldset>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="report-desc">{t("report.description.label")}</Label>
          <span className="text-muted text-xs">
            {description.length} / {REPORT_MAX_DESCRIPTION}
          </span>
        </div>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextArea
              id="report-desc"
              rows={5}
              maxLength={REPORT_MAX_DESCRIPTION}
              placeholder={t("report.description.placeholder")}
              aria-invalid={Boolean(errors.description)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <FieldError
          message={
            errors.description?.message
              ? t("report.errors.description")
              : undefined
          }
        />
      </div>

      {/* Evidence */}
      <Controller
        control={control}
        name="evidence"
        render={({ field }) => {
          const files = field.value ?? [];
          const addFiles = (list: FileList | null) => {
            if (!list) return;
            const names = Array.from(list).map((f) => f.name);
            field.onChange([...files, ...names].slice(0, REPORT_MAX_EVIDENCE));
          };
          return (
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-evidence">
                {t("report.evidence.label")}{" "}
                <span className="text-muted font-normal">
                  · {t("report.evidence.optional")}
                </span>
              </Label>
              <label className="border-border hover:border-primary-lightskyblue/50 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors">
                <DocumentUpload
                  size={18}
                  color="currentColor"
                  className="text-muted"
                />
                <span className="text-muted">{t("report.evidence.hint")}</span>
                <input
                  id="report-evidence"
                  type="file"
                  multiple
                  className="sr-only"
                  disabled={files.length >= REPORT_MAX_EVIDENCE}
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {files.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {files.map((name, i) => (
                    <li
                      key={`${name}-${i}`}
                      className="bg-surface flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <span className="truncate">{name}</span>
                      <button
                        type="button"
                        aria-label={t("report.evidence.remove")}
                        onClick={() =>
                          field.onChange(files.filter((_, x) => x !== i))
                        }
                        className="text-muted hover:text-danger transition-colors"
                      >
                        <Trash size={16} color="currentColor" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        }}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="tertiary"
          onPress={() => router.push("/explore")}
        >
          {t("report.actions.cancel")}
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isPending={isSubmitting}
        >
          {t("report.actions.submit")}
        </Button>
      </div>
    </Form>
  );
}
