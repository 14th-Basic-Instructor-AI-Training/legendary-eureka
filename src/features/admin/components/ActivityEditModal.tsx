"use client";

import { useEffect } from "react";
import { Controller, useForm, type Control, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { AddCircle, Edit2 } from "iconsax-reactjs";
import {
  Autocomplete,
  Button,
  EmptyState,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  SearchField,
  Select,
  TextArea,
  useFilter,
} from "@/ui";
import { useSession } from "@/lib/auth";
import {
  CAMBODIA_PROVINCE_CODES,
  DestinationCategorySchema,
  TravelTypeSchema,
} from "@/features/destinations/schema";
import { useAdminStore } from "../store";
import {
  ActivityDraftSchema,
  ActivityStatusSchema,
  draftToActivityFields,
  type ActivityDraft,
  type PlatformActivity,
} from "../schema";

const CATEGORY_OPTIONS = DestinationCategorySchema.options;
const STATUS_OPTIONS = ActivityStatusSchema.options;
const PROVINCE_OPTIONS = CAMBODIA_PROVINCE_CODES;
const TRAVEL_OPTIONS = TravelTypeSchema.options;

/** A blank destination — the defaults for "Create destination". */
const EMPTY_DRAFT: ActivityDraft = {
  name: "",
  description: "",
  province: "PHNOM_PENH",
  travelType: "ADVENTURE",
  category: "destination",
  status: "draft",
  coverImageUrl: "",
  priceFrom: 0,
  currency: "USD",
  latitude: 0,
  longitude: 0,
};

/** Hydrate the form from an existing activity (API `name` ← list `title`). */
function toDraft(a: PlatformActivity): ActivityDraft {
  return {
    name: a.title,
    description: a.description ?? "",
    province: a.province ?? "PHNOM_PENH",
    travelType: a.travelType ?? "ADVENTURE",
    category: a.category,
    status: a.status,
    coverImageUrl: a.coverImageUrl ?? "",
    priceFrom: a.priceFrom ?? 0,
    currency: a.currency ?? "USD",
    latitude: a.latitude ?? 0,
    longitude: a.longitude ?? 0,
  };
}

// ─── field helpers ───────────────────────────────────────────────────────────

type FieldProps = {
  control: Control<ActivityDraft>;
  name: Path<ActivityDraft>;
  label: string;
  error?: string;
};

function TextField({
  control,
  name,
  label,
  error,
  type = "text",
  placeholder,
}: FieldProps & { type?: "text" | "url" | "number"; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`af-${name}`}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={`af-${name}`}
            type={type}
            inputMode={type === "number" ? "decimal" : undefined}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            value={field.value == null ? "" : String(field.value)}
            onChange={
              type === "number"
                ? (e) => {
                    const n = parseFloat(e.target.value);
                    field.onChange(Number.isNaN(n) ? 0 : n);
                  }
                : field.onChange
            }
            onBlur={field.onBlur}
          />
        )}
      />
      {error ? (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextAreaField({ control, name, label, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`af-${name}`}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextArea
            id={`af-${name}`}
            rows={3}
            aria-invalid={Boolean(error)}
            value={field.value == null ? "" : String(field.value)}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {error ? (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function EnumField({
  control,
  name,
  label,
  options,
  optionLabel,
}: Omit<FieldProps, "error"> & {
  options: readonly string[];
  optionLabel: (value: string) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`af-${name}`}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            id={`af-${name}`}
            aria-label={label}
            selectedKey={field.value as string}
            onSelectionChange={(key) => {
              if (key !== null) field.onChange(key);
            }}
            onBlur={field.onBlur}
          >
            <Select.Trigger>
              <Select.Value>
                {({ selectedText }) =>
                  selectedText ? optionLabel(String(field.value)) : null
                }
              </Select.Value>
              <Select.Indicator className="text-text-input-color" />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {options.map((value) => (
                  <ListBox.Item key={value} id={value} textValue={optionLabel(value)}>
                    {optionLabel(value)}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />
    </div>
  );
}

/** Province picker — a Select with type-to-filter (HeroUI Autocomplete). */
function ProvinceField({
  control,
  label,
  optionLabel,
  searchPlaceholder,
  noResults,
}: {
  control: Control<ActivityDraft>;
  label: string;
  optionLabel: (value: string) => string;
  searchPlaceholder: string;
  noResults: string;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  return (
    <Controller
      control={control}
      name="province"
      render={({ field }) => (
        <Autocomplete
          className="flex flex-col gap-1.5"
          aria-label={label}
          selectionMode="single"
          value={field.value as string}
          onChange={(key) => {
            if (key != null && !Array.isArray(key)) field.onChange(String(key));
          }}
        >
          <Label>{label}</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.Indicator className="text-text-input-color" />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter filter={contains}>
              <SearchField autoFocus name="province-search" variant="secondary">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder={searchPlaceholder} />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox renderEmptyState={() => <EmptyState>{noResults}</EmptyState>}>
                {PROVINCE_OPTIONS.map((value) => (
                  <ListBox.Item key={value} id={value} textValue={optionLabel(value)}>
                    {optionLabel(value)}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>
      )}
    />
  );
}

// ─── modal ───────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  /** The activity being edited, or `null` for create mode. */
  activity: PlatformActivity | null;
  onClose: () => void;
}

/**
 * Content-moderation modal for destinations. Creates a new destination (when
 * `activity` is null) or edits an existing one. The store re-checks
 * `can(role, "editAnyActivity")` on submit, so no role gating happens here.
 */
export function ActivityEditModal({ isOpen, activity, onClose }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const createActivity = useAdminStore((s) => s.createActivity);
  const updateActivity = useAdminStore((s) => s.updateActivity);
  const isEdit = activity !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityDraft>({
    resolver: zodResolver(ActivityDraftSchema),
    defaultValues: EMPTY_DRAFT,
  });

  // Repopulate whenever the modal opens (create → blank, edit → the activity).
  useEffect(() => {
    if (!isOpen) return;
    reset(activity ? toDraft(activity) : EMPTY_DRAFT);
  }, [isOpen, activity, reset]);

  const onSubmit = (values: ActivityDraft) => {
    if (activity) updateActivity(role, activity.id, draftToActivityFields(values));
    else createActivity(role, values);
    onClose();
  };

  const f = (key: string) => t(`admin.activities.editModal.fields.${key}`);
  const tProvince = (v: string) => t(`destinations.provinces.${v}`);
  const tTravel = (v: string) => t(`destinations.travelTypes.${v}`);
  const tCategory = (v: string) => t(`destinations.categories.${v}`);
  const tStatus = (v: string) => t(`status.${v}`);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="lg" placement="center" className="w-full sm:max-w-3xl">
          <Modal.Dialog className="w-full sm:max-w-3xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-primary">
                {isEdit ? (
                  <Edit2 size={20} color="currentColor" />
                ) : (
                  <AddCircle size={20} color="currentColor" />
                )}
              </Modal.Icon>
              <Modal.Heading>
                {isEdit
                  ? t("admin.activities.editModal.title")
                  : t("admin.activities.editModal.createTitle")}
              </Modal.Heading>
            </Modal.Header>

            <Form
              className="flex flex-col gap-5"
              validationBehavior="aria"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Modal.Body className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                <TextField
                  control={control}
                  name="name"
                  label={f("name")}
                  error={errors.name?.message}
                  placeholder={f("namePlaceholder")}
                />
                <TextAreaField
                  control={control}
                  name="description"
                  label={f("description")}
                  error={errors.description?.message}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProvinceField
                    control={control}
                    label={f("province")}
                    optionLabel={tProvince}
                    searchPlaceholder={t("admin.activities.editModal.searchProvince")}
                    noResults={t("common.noResults")}
                  />
                  <EnumField
                    control={control}
                    name="travelType"
                    label={f("travelType")}
                    options={TRAVEL_OPTIONS}
                    optionLabel={tTravel}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <EnumField
                    control={control}
                    name="category"
                    label={f("category")}
                    options={CATEGORY_OPTIONS}
                    optionLabel={tCategory}
                  />
                  <EnumField
                    control={control}
                    name="status"
                    label={f("status")}
                    options={STATUS_OPTIONS}
                    optionLabel={tStatus}
                  />
                </div>

                <TextField
                  control={control}
                  name="coverImageUrl"
                  type="url"
                  label={f("coverImageUrl")}
                  error={errors.coverImageUrl?.message}
                  placeholder="https://…"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    control={control}
                    name="priceFrom"
                    type="number"
                    label={f("priceFrom")}
                    error={errors.priceFrom?.message}
                  />
                  <TextField
                    control={control}
                    name="currency"
                    label={f("currency")}
                    error={errors.currency?.message}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    control={control}
                    name="latitude"
                    type="number"
                    label={f("latitude")}
                    error={errors.latitude?.message}
                  />
                  <TextField
                    control={control}
                    name="longitude"
                    type="number"
                    label={f("longitude")}
                    error={errors.longitude?.message}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" onPress={onClose}>
                  {t("admin.activities.editModal.cancel")}
                </Button>
                <Button type="submit" variant="primary" isPending={isSubmitting}>
                  {isEdit
                    ? t("admin.activities.editModal.save")
                    : t("admin.activities.editModal.create")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
