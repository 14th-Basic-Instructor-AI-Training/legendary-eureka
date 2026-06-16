"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Add,
  Calendar,
  Edit2,
  Routing,
  Trash,
  SearchNormal1,
  Building,
  Cup,
  Tree,
  Home2,
} from "iconsax-reactjs";
import { sileo } from "sileo";
import { Button, Input, Label, Modal, TextArea } from "@/ui";
import { useConfirm } from "@/ui";
import type { TourAgendaItemResponse } from "@/lib/api/packages";
import {
  addAgendaDayAction,
  updateAgendaDayAction,
  removeAgendaDayAction,
} from "@/actions/tours";

export type AgendaActivity = {
  id: string;
  name: string;
  category: "destination" | "thingToDo" | "food" | "stay";
};

type Props = {
  tourId: string;
  initialAgenda: TourAgendaItemResponse[];
  durationDays: number;
  activities: AgendaActivity[];
  onAgendaChange?: (agenda: TourAgendaItemResponse[]) => void;
};

// ── Agenda persistence ────────────────────────────────────────────────────────

function agendaKey(tourId: string) {
  return `agenda-${tourId}`;
}

function readAgenda(tourId: string): TourAgendaItemResponse[] | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(agendaKey(tourId)) : null;
    return raw ? (JSON.parse(raw) as TourAgendaItemResponse[]) : null;
  } catch {
    return null;
  }
}

function saveAgenda(tourId: string, agenda: TourAgendaItemResponse[]) {
  try { localStorage.setItem(agendaKey(tourId), JSON.stringify(agenda)); } catch { /* ignore */ }
}

export function clearAgenda(tourId: string) {
  try { localStorage.removeItem(agendaKey(tourId)); } catch { /* ignore */ }
}

const DaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  activityIds: z.array(z.string()).default([]),
});
type DayFormValues = z.input<typeof DaySchema>;
type DayInput = z.output<typeof DaySchema>;

const CATEGORY_ORDER: AgendaActivity["category"][] = [
  "destination",
  "thingToDo",
  "food",
  "stay",
];

function categoryIcon(cat: AgendaActivity["category"]) {
  const size = 13;
  const color = "currentColor";
  switch (cat) {
    case "destination":
      return <Building size={size} color={color} variant="Bold" />;
    case "thingToDo":
      return <Tree size={size} color={color} variant="Bold" />;
    case "food":
      return <Cup size={size} color={color} variant="Bold" />;
    case "stay":
      return <Home2 size={size} color={color} variant="Bold" />;
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger mt-1 text-xs" role="alert">
      {message}
    </p>
  );
}

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; item: TourAgendaItemResponse };

export function AgendaBuilder({ tourId, initialAgenda, durationDays, activities, onAgendaChange }: Props) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  // Restore persisted agenda on mount so a page reload doesn't lose progress
  const [agenda, setAgenda] = useState<TourAgendaItemResponse[]>(() => {
    const saved = readAgenda(tourId);
    const base = saved ?? initialAgenda;
    return [...base].sort((a, b) => a.dayNumber - b.dayNumber);
  });

  function applyAgenda(next: TourAgendaItemResponse[]) {
    const sorted = [...next].sort((a, b) => a.dayNumber - b.dayNumber);
    setAgenda(sorted);
    saveAgenda(tourId, sorted);
    onAgendaChange?.(sorted);
  }
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");

  const nextDayNumber = useMemo(() => {
    if (agenda.length === 0) return 1;
    return Math.max(...agenda.map((d) => d.dayNumber)) + 1;
  }, [agenda]);

  const editingItem = modal?.mode === "edit" ? modal.item : null;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DayFormValues, unknown, DayInput>({
    resolver: zodResolver(DaySchema),
    defaultValues: {
      dayNumber: nextDayNumber,
      title: "",
      description: "",
      activityIds: [],
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedIds = watch("activityIds") ?? [];

  const openAdd = () => {
    reset({ dayNumber: nextDayNumber, title: "", description: "", activityIds: [] });
    setActivitySearch("");
    setModal({ mode: "add" });
  };

  const openEdit = (item: TourAgendaItemResponse) => {
    reset({
      dayNumber: item.dayNumber,
      title: item.title ?? "",
      description: item.description ?? "",
      activityIds: item.activities ?? [],
    });
    setActivitySearch("");
    setModal({ mode: "edit", item });
  };

  const closeModal = () => {
    setModal(null);
    setActivitySearch("");
  };

  const toggleActivity = (id: string) => {
    const current = selectedIds;
    setValue(
      "activityIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldValidate: false },
    );
  };

  const onSubmit = async (values: DayInput) => {
    setSaving(true);
    try {
      const body = {
        dayNumber: values.dayNumber,
        title: values.title,
        description: values.description || undefined,
        activities: values.activityIds.length ? values.activityIds : undefined,
      };

      let updated;
      if (modal?.mode === "edit" && editingItem) {
        updated = await updateAgendaDayAction(tourId, editingItem.id, body);
        sileo.success({ title: t("tours.packages.agenda.toastUpdated", { day: values.dayNumber }) });
      } else {
        updated = await addAgendaDayAction(tourId, body);
        sileo.success({ title: t("tours.packages.agenda.toastAdded", { day: values.dayNumber }) });
      }

      applyAgenda(updated.agenda ?? []);
      closeModal();
    } catch (e) {
      const msg = e instanceof Error ? e.message : undefined;
      sileo.error({
        title: t("tours.packages.agenda.toastError"),
        description: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: TourAgendaItemResponse) => {
    const ok = await confirm({
      title: t("tours.packages.agenda.deleteConfirm", { day: item.dayNumber }),
      description: t("tours.packages.agenda.deleteBody"),
      intent: "danger",
      confirmLabel: t("tours.packages.agenda.deleteDay"),
      onConfirm: async () => {
        const res = await removeAgendaDayAction(tourId, item.id);
        if (!res.ok) throw new Error(res.error);
        applyAgenda(agenda.filter((d) => d.id !== item.id));
        sileo.success({ title: t("tours.packages.agenda.toastRemoved", { day: item.dayNumber }) });
      },
    });
    if (!ok) return;
  };

  // Activity picker: filter + group
  const filteredActivities = useMemo(() => {
    const q = activitySearch.toLowerCase();
    return activities.filter((a) => !q || a.name.toLowerCase().includes(q));
  }, [activities, activitySearch]);

  const groupedActivities = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      items: filteredActivities.filter((a) => a.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [filteredActivities]);

  const isOpen = modal !== null;
  const modalTitle =
    modal?.mode === "edit"
      ? t("tours.packages.agenda.editDay", { day: editingItem?.dayNumber })
      : t("tours.packages.agenda.addDayTitle", { day: nextDayNumber });

  return (
    <>
      <section className="bg-surface border-border shadow-primary rounded-2xl border p-5">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
              <Routing size={18} color="currentColor" variant="Bold" />
            </div>
            <div>
              <h2 className="text-text-primary text-base font-semibold tracking-tight">
                {t("tours.packages.agenda.title")}
              </h2>
              <p className="text-muted mt-0.5 text-xs leading-relaxed">
                {t("tours.packages.agenda.subtitle", { count: durationDays })}
              </p>
            </div>
          </div>
          {agenda.length > 0 && (
            <Button variant="secondary" size="sm" onPress={openAdd}>
              <Add size={15} color="currentColor" />
              {t("tours.packages.agenda.addDay")}
            </Button>
          )}
        </div>

        {/* Empty state */}
        {agenda.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Calendar size={22} color="currentColor" variant="Bulk" className="text-muted" />
            </span>
            <p className="text-muted text-sm">{t("tours.packages.agenda.empty")}</p>
            <Button variant="primary" size="sm" onPress={openAdd}>
              <Add size={15} color="currentColor" />
              {t("tours.packages.agenda.addDayTitle", { day: 1 })}
            </Button>
          </div>
        ) : (
          /* Timeline */
          <ol className="flex flex-col gap-0">
            {agenda.map((day, idx) => {
              const isLast = idx === agenda.length - 1;
              const linkedNames = (day.activities ?? [])
                .map((id) => activities.find((a) => a.id === id)?.name ?? id)
                .filter(Boolean);

              return (
                <li key={day.id} className="flex gap-4">
                  {/* Connector column */}
                  <div className="flex flex-col items-center">
                    <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {day.dayNumber}
                    </span>
                    {!isLast && <span className="bg-border mt-1 w-px flex-1" />}
                  </div>

                  {/* Day card */}
                  <div
                    className={`border-border bg-bg-ghostwhite/40 min-w-0 flex-1 rounded-2xl border p-4 ${isLast ? "mb-0" : "mb-3"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-primary text-[10px] font-medium tracking-wide uppercase">
                          {t("tours.detail.travelPlan.day", { day: day.dayNumber })}
                        </p>
                        <p className="text-text-primary text-sm font-semibold">{day.title}</p>
                        {day.description ? (
                          <p className="text-muted mt-1 text-xs leading-relaxed">
                            {day.description}
                          </p>
                        ) : null}
                        {linkedNames.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {linkedNames.map((name) => (
                              <span
                                key={name}
                                className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Day actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="tertiary"
                          size="sm"
                          onPress={() => openEdit(day)}
                          aria-label={t("tours.packages.agenda.editDay", { day: day.dayNumber })}
                        >
                          <Edit2 size={14} color="currentColor" />
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          className="text-danger"
                          onPress={() => handleDelete(day)}
                          aria-label={t("tours.packages.agenda.deleteDay")}
                        >
                          <Trash size={14} color="currentColor" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Add / Edit Day modal */}
      <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <Modal.Backdrop>
          <Modal.Container size="lg" placement="center">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{modalTitle}</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <form
                  id="day-form"
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {/* Day number + Title */}
                  <div className="grid grid-cols-[80px_1fr] gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="day-number">
                        {t("tours.packages.agenda.dayNumber")}
                        <span className="text-danger ml-0.5" aria-hidden="true">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="dayNumber"
                        render={({ field }) => (
                          <Input
                            id="day-number"
                            type="number"
                            min={1}
                            aria-invalid={Boolean(errors.dayNumber)}
                            value={String(field.value)}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                      <FieldError message={errors.dayNumber?.message} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="day-title">
                        {t("tours.packages.agenda.dayTitle")}
                        <span className="text-danger ml-0.5" aria-hidden="true">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="title"
                        render={({ field }) => (
                          <Input
                            id="day-title"
                            placeholder={t("tours.packages.agenda.dayTitlePlaceholder")}
                            aria-invalid={Boolean(errors.title)}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                      <FieldError message={errors.title?.message} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="day-description">
                      {t("tours.packages.agenda.dayDescription")}
                      <span className="text-muted ml-1 text-xs font-normal">
                        — {t("common.optional")}
                      </span>
                    </Label>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <TextArea
                          id="day-description"
                          placeholder={t("tours.packages.agenda.dayDescPlaceholder")}
                          rows={2}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>

                  {/* Activity picker */}
                  <div className="flex flex-col gap-2">
                    <Label>{t("tours.packages.agenda.activities")}</Label>

                    {activities.length === 0 ? (
                      <p className="text-muted bg-muted/5 rounded-xl border border-dashed px-4 py-5 text-center text-sm">
                        {t("tours.packages.agenda.noActivities")}
                      </p>
                    ) : (
                      <div className="border-border overflow-hidden rounded-xl border">
                        {/* Search */}
                        <div className="border-border relative border-b px-3 py-2">
                          <SearchNormal1
                            size={15}
                            color="currentColor"
                            className="text-muted pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
                          />
                          <input
                            type="text"
                            value={activitySearch}
                            onChange={(e) => setActivitySearch(e.target.value)}
                            placeholder={t("tours.packages.agenda.activitiesSearch")}
                            className="text-foreground placeholder:text-muted bg-transparent w-full py-1 pl-7 text-sm outline-none"
                          />
                        </div>

                        {/* Grouped list */}
                        <div className="max-h-52 overflow-y-auto">
                          {groupedActivities.length === 0 ? (
                            <p className="text-muted px-4 py-4 text-center text-sm">
                              {t("common.noResults")}
                            </p>
                          ) : (
                            groupedActivities.map(({ cat, items }) => (
                              <div key={cat}>
                                <div className="bg-bg-ghostwhite text-text-secondary sticky top-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide">
                                  {categoryIcon(cat)}
                                  {t(`tours.packages.agenda.categories.${cat}`)}
                                </div>
                                {items.map((act) => {
                                  const checked = selectedIds.includes(act.id);
                                  return (
                                    <button
                                      key={act.id}
                                      type="button"
                                      onClick={() => toggleActivity(act.id)}
                                      className={`hover:bg-bg-ghostwhite flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${checked ? "bg-primary/5" : ""}`}
                                    >
                                      <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                          checked
                                            ? "bg-primary border-primary text-white"
                                            : "border-border"
                                        }`}
                                        aria-hidden="true"
                                      >
                                        {checked && (
                                          <svg
                                            width="10"
                                            height="8"
                                            viewBox="0 0 10 8"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M1 4L3.5 6.5L9 1"
                                              stroke="currentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                      </span>
                                      <span className={checked ? "text-text-primary font-medium" : "text-foreground"}>
                                        {act.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Selected count */}
                        {selectedIds.length > 0 && (
                          <div className="border-border bg-bg-ghostwhite border-t px-4 py-2">
                            <span className="text-primary text-xs font-medium">
                              {selectedIds.length}{" "}
                              {t(
                                selectedIds.length === 1
                                  ? "tours.packages.agenda.selectedOne"
                                  : "tours.packages.agenda.selectedMany",
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" size="sm" onPress={closeModal}>
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  form="day-form"
                  variant="primary"
                  size="sm"
                  isPending={saving}
                >
                  {t("tours.packages.agenda.saveDay")}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
