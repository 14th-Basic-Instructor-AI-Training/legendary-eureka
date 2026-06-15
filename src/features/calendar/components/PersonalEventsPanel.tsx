"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Add, Trash, CalendarAdd } from "iconsax-reactjs";
import { Button, Form, Input, Label, Modal, TextArea } from "@/ui";
import { useConfirm } from "@/ui";
import {
  createPersonalEvent,
  deletePersonalEvent,
  type PersonalEventResponse,
} from "@/lib/api/calendar";
import { PersonalEventFormSchema, type PersonalEventFormValues } from "../schema";

interface PersonalEventsPanelProps {
  events: PersonalEventResponse[];
  onChanged: () => void;
}

const PERSONAL_COLOR = "#10B981";

/**
 * Lists the user's personal events with delete buttons, plus an "Add Event"
 * modal for creating new ones. Calls the real API and fires `onChanged` so
 * the parent can reload the calendar data.
 */
export function PersonalEventsPanel({ events, onChanged }: PersonalEventsPanelProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalEventFormValues>({
    resolver: zodResolver(PersonalEventFormSchema),
    defaultValues: { title: "", description: "", startDate: "", endDate: "", allDay: true },
  });

  const openModal = () => {
    reset({ title: "", description: "", startDate: "", endDate: "", allDay: true });
    setOpen(true);
  };

  const handleCreate = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await createPersonalEvent({
        title: values.title,
        description: values.description || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        allDay: values.allDay,
      });
      setOpen(false);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async (event: PersonalEventResponse) => {
    const ok = await confirm({
      intent: "danger",
      title: t("calendar.personal.deleteTitle"),
      description: t("calendar.personal.deleteDescription", { title: event.title }),
      confirmLabel: t("common.delete"),
    });
    if (!ok) return;
    await deletePersonalEvent(event.id);
    onChanged();
  };

  const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="border-border rounded-xl border bg-white">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: PERSONAL_COLOR }}
          />
          <span className="text-sm font-semibold">{t("calendar.personal.title")}</span>
          {events.length > 0 && (
            <span className="text-muted rounded-full bg-gray-100 px-2 py-0.5 text-xs">
              {events.length}
            </span>
          )}
        </div>
        <Button size="sm" variant="secondary" onPress={openModal} className="gap-1">
          <Add size={14} color="currentColor" />
          {t("calendar.personal.addEvent")}
        </Button>
      </div>

      {/* Event list */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CalendarAdd size={28} color="#9ca3af" />
          <p className="text-muted text-sm">{t("calendar.personal.empty")}</p>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: PERSONAL_COLOR }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ev.title}</p>
                <p className="text-muted text-xs">
                  {formatDate(ev.startDate)}
                  {ev.endDate !== ev.startDate && ` – ${formatDate(ev.endDate)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(ev)}
                aria-label={t("common.delete")}
                className="text-muted hover:text-danger shrink-0 rounded p-1 transition-colors"
              >
                <Trash size={15} color="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add Event Modal */}
      <Modal isOpen={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
        <Modal.Backdrop>
          <Modal.Container size="md" placement="center">
            <Modal.Dialog>
              <Modal.Header className="flex items-center gap-2">
                <Modal.Icon className="text-primary">
                  <CalendarAdd size={20} color="currentColor" />
                </Modal.Icon>
                <Modal.Heading>{t("calendar.personal.modalTitle")}</Modal.Heading>
              </Modal.Header>

              <Form
                className="flex flex-col"
                validationBehavior="aria"
                onSubmit={handleCreate}
              >
                <Modal.Body className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pe-title">{t("calendar.personal.fields.title")}</Label>
                    <Controller
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <Input
                          id="pe-title"
                          placeholder={t("calendar.personal.fields.titlePlaceholder")}
                          aria-invalid={Boolean(errors.title)}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    {errors.title && (
                      <p className="text-danger text-sm" role="alert">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pe-desc">{t("calendar.personal.fields.description")}</Label>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <TextArea
                          id="pe-desc"
                          rows={3}
                          placeholder={t("calendar.personal.fields.descriptionPlaceholder")}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pe-start">{t("calendar.personal.fields.startDate")}</Label>
                      <Controller
                        control={control}
                        name="startDate"
                        render={({ field }) => (
                          <Input
                            id="pe-start"
                            type="date"
                            aria-invalid={Boolean(errors.startDate)}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                      {errors.startDate && (
                        <p className="text-danger text-sm" role="alert">
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pe-end">{t("calendar.personal.fields.endDate")}</Label>
                      <Controller
                        control={control}
                        name="endDate"
                        render={({ field }) => (
                          <Input
                            id="pe-end"
                            type="date"
                            aria-invalid={Boolean(errors.endDate)}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                      {errors.endDate && (
                        <p className="text-danger text-sm" role="alert">
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="tertiary"
                    onPress={() => setOpen(false)}
                    isDisabled={submitting}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" variant="primary" isPending={submitting}>
                    {t("calendar.personal.save")}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
