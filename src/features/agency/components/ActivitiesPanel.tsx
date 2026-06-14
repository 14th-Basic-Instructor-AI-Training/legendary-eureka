"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Add, CloseCircle, Edit2, TickCircle } from "iconsax-reactjs";
import { Button, Card, Form, Input, Label, StatusChip } from "@/ui";
import { cn } from "@/lib/utils";
import { formatPrice, formatRating } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { DestinationCategorySchema } from "@/features/destinations/schema";
import {
  NewActivitySchema,
  type NewActivityFormValues,
  type NewActivityInput,
} from "../schema";
import { useAgencyStore } from "../store";

const CATEGORIES = DestinationCategorySchema.options;

export function ActivitiesPanel() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const activities = useAgencyStore((s) => s.activities);
  const addActivity = useAgencyStore((s) => s.addActivity);
  const [showForm, setShowForm] = useState(false);
  const [editRequested, setEditRequested] = useState<Set<string>>(new Set());

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewActivityFormValues, unknown, NewActivityInput>({
    resolver: zodResolver(NewActivitySchema),
    defaultValues: { title: "", category: "thingToDo", location: "", priceFrom: 0 },
  });

  const onSubmit = (values: NewActivityInput) => {
    addActivity(role, values);
    reset();
    setShowForm(false);
  };

  const requestEdit = (id: string) =>
    setEditRequested((prev) => new Set(prev).add(id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t("agency.activities.title")}</h2>
        <Button variant="primary" size="sm" onPress={() => setShowForm((v) => !v)}>
          {showForm ? (
            <CloseCircle size={16} color="currentColor" />
          ) : (
            <Add size={16} color="currentColor" />
          )}
          {t("agency.activities.new")}
        </Button>
      </div>

      {showForm ? (
        <Card className="bg-surface border-border rounded-2xl border p-5">
          <Form
            className="flex flex-col gap-4"
            validationBehavior="aria"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">{t("agency.activities.form.name")}</Label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder={t("agency.activities.form.namePlaceholder")}
                    aria-invalid={Boolean(errors.title)}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.title ? (
                <p className="text-danger text-sm" role="alert">
                  {errors.title.message}
                </p>
              ) : null}
            </div>

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>{t("agency.activities.form.category")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const active = field.value === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => field.onChange(cat)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted hover:text-foreground",
                          )}
                        >
                          {t(`destinations.categories.${cat}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location">{t("agency.activities.form.location")}</Label>
                <Controller
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <Input
                      id="location"
                      placeholder={t("agency.activities.form.locationPlaceholder")}
                      aria-invalid={Boolean(errors.location)}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.location ? (
                  <p className="text-danger text-sm" role="alert">
                    {errors.location.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="priceFrom">{t("agency.activities.form.price")}</Label>
                <Controller
                  control={control}
                  name="priceFrom"
                  render={({ field }) => (
                    <Input
                      id="priceFrom"
                      type="number"
                      min={0}
                      aria-invalid={Boolean(errors.priceFrom)}
                      value={String(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.priceFrom ? (
                  <p className="text-danger text-sm" role="alert">
                    {errors.priceFrom.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="tertiary" onPress={() => setShowForm(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" variant="primary" isPending={isSubmitting}>
                {t("agency.activities.form.submit")}
              </Button>
            </div>
          </Form>
        </Card>
      ) : null}

      {activities.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("agency.activities.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {activities.map((a) => (
            <li
              key={a.id}
              className="bg-surface border-border flex flex-wrap items-center gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{a.title}</p>
                  <StatusChip status={a.status} />
                </div>
                <p className="text-muted mt-0.5 text-sm">
                  {t(`destinations.categories.${a.category}`)} · {a.location}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{formatPrice(a.priceFrom, a.currency, lng)}</p>
                {a.rating > 0 ? (
                  <p className="text-muted text-xs">★ {formatRating(a.rating, lng)}</p>
                ) : null}
              </div>
              {a.status === "published" ? (
                editRequested.has(a.id) ? (
                  <span className="text-success flex items-center gap-1 text-xs font-medium">
                    <TickCircle size={14} color="currentColor" variant="Bold" />
                    {t("agency.activities.editRequest.sent")}
                  </span>
                ) : (
                  <Button variant="secondary" size="sm" onPress={() => requestEdit(a.id)}>
                    <Edit2 size={14} color="currentColor" />
                    {t("agency.activities.requestEdit")}
                  </Button>
                )
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
