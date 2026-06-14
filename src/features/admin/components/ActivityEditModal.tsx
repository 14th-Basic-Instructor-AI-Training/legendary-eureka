"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Edit2 } from "iconsax-reactjs";
import { Button, Form, Input, Label, ListBox, Modal, Select } from "@/ui";
import { useSession } from "@/lib/auth";
import { DestinationCategorySchema } from "@/features/destinations/schema";
import { useAdminStore } from "../store";
import { ActivityEditSchema, ActivityStatusSchema, type ActivityEdit, type PlatformActivity } from "../schema";

const CATEGORY_OPTIONS = DestinationCategorySchema.options;
const STATUS_OPTIONS = ActivityStatusSchema.options;

interface Props {
  activity: PlatformActivity | null;
  onClose: () => void;
}

/**
 * Controlled content-moderation modal: edits one platform activity's title,
 * category and status. Open when `activity !== null`. The store re-checks
 * `can(role, "editAnyActivity")` on submit, so no role gating happens here.
 */
export function ActivityEditModal({ activity, onClose }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const updateActivity = useAdminStore((s) => s.updateActivity);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityEdit>({
    resolver: zodResolver(ActivityEditSchema),
    defaultValues: {
      title: activity?.title ?? "",
      category: activity?.category ?? "destination",
      status: activity?.status ?? "draft",
    },
  });

  // The same modal instance is reused across rows — repopulate when the
  // selected activity changes (guard for the closed/null state).
  useEffect(() => {
    if (!activity) return;
    reset({ title: activity.title, category: activity.category, status: activity.status });
  }, [activity, reset]);

  const onSubmit = (values: ActivityEdit) => {
    if (activity) updateActivity(role, activity.id, values);
    onClose();
  };

  return (
    <Modal
      isOpen={activity !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="md" placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-primary">
                <Edit2 size={20} color="currentColor" />
              </Modal.Icon>
              <Modal.Heading>{t("admin.activities.editModal.title")}</Modal.Heading>
            </Modal.Header>

            <Form
              className="flex flex-col gap-5"
              validationBehavior="aria"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Modal.Body className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="activity-title">
                    {t("admin.activities.editModal.fields.title")}
                  </Label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <Input
                        id="activity-title"
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

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="activity-category">
                    {t("admin.activities.editModal.fields.category")}
                  </Label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select
                        id="activity-category"
                        aria-label={t("admin.activities.editModal.fields.category")}
                        selectedKey={field.value}
                        onSelectionChange={(key) => {
                          if (key !== null) field.onChange(key);
                        }}
                        onBlur={field.onBlur}
                      >
                        <Select.Trigger>
                          <Select.Value>
                            {({ selectedText }) =>
                              selectedText
                                ? t(`destinations.categories.${field.value}`)
                                : null
                            }
                          </Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {CATEGORY_OPTIONS.map((value) => (
                              <ListBox.Item
                                key={value}
                                id={value}
                                textValue={t(`destinations.categories.${value}`)}
                              >
                                {t(`destinations.categories.${value}`)}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="activity-status">
                    {t("admin.activities.editModal.fields.status")}
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        id="activity-status"
                        aria-label={t("admin.activities.editModal.fields.status")}
                        selectedKey={field.value}
                        onSelectionChange={(key) => {
                          if (key !== null) field.onChange(key);
                        }}
                        onBlur={field.onBlur}
                      >
                        <Select.Trigger>
                          <Select.Value>
                            {({ selectedText }) =>
                              selectedText ? t(`status.${field.value}`) : null
                            }
                          </Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {STATUS_OPTIONS.map((value) => (
                              <ListBox.Item key={value} id={value} textValue={t(`status.${value}`)}>
                                {t(`status.${value}`)}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" onPress={onClose}>
                  {t("admin.activities.editModal.cancel")}
                </Button>
                <Button type="submit" variant="primary" isPending={isSubmitting}>
                  {t("admin.activities.editModal.save")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
