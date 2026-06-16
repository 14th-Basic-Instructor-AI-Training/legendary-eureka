"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Add,
  Lock1,
  Edit2,
  Trash,
  CloseCircle,
  Location,
  ArrowLeft2,
  ArrowRight2,
  Lock,
  Category,
  Cup,
  Buildings,
  Flash,
  DocumentUpload,
  TickCircle,
} from "iconsax-reactjs";
import { useAgencyStore } from "@/features/agency/store";
import {
  getActivities,
  createAgencyActivity,
  updateAgencyActivity,
  deleteAgencyActivity,
} from "@/features/agency/data";
import {
  NewActivitySchema,
  type Activity,
  type NewActivityInput,
} from "@/features/agency/schema";
import {
  Button,
  Input,
  TextArea,
  Label,
  Form,
  Modal,
  StatusChip,
  Select,
  ListBox,
  SearchField,
  Skeleton,
} from "@/ui";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 8;

const PROVINCES = [
  "Siem Reap",
  "Phnom Penh",
  "Battambang",
  "Kampot",
  "Sihanoukville",
  "Preah Vihear",
  "Koh Kong",
  "Kratie",
];

const DESTINATION_CATEGORIES = [
  "Historical Site",
  "Natural Wonder",
  "Cultural Heritage",
  "Archaeological Site",
  "Religious Site",
];

const AMENITY_OPTIONS = [
  "WiFi",
  "Swimming Pool",
  "Breakfast Incl.",
  "Free Parking",
  "Airport Transfer",
  "Spa & Wellness",
  "Fitness Center",
  "On-site Restaurant",
];

const CATEGORY_CONFIG = {
  destination: {
    tabKey: "agency.activitiesPage.destinations",
    labelKey: "agency.activitiesPage.destination",
    iconClass: "bg-blue-500/10 text-blue-600",
    coverBg: "#1A5FA5",
  },
  thingToDo: {
    tabKey: "agency.activitiesPage.thingsToDo",
    labelKey: "agency.activitiesPage.thingToDo",
    iconClass: "bg-amber-500/10 text-amber-600",
    coverBg: "#D97706",
  },
  food: {
    tabKey: "agency.activitiesPage.restaurants",
    labelKey: "agency.activitiesPage.food",
    iconClass: "bg-emerald-500/10 text-emerald-600",
    coverBg: "#059669",
  },
  stay: {
    tabKey: "agency.activitiesPage.accommodations",
    labelKey: "agency.activitiesPage.stay",
    iconClass: "bg-violet-500/10 text-violet-600",
    coverBg: "#6D28D9",
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;
type TabId = "all" | CategoryKey;

const TABS: { id: TabId; labelKey: string }[] = [
  { id: "all", labelKey: "agency.activitiesPage.all" },
  { id: "destination", labelKey: "agency.activitiesPage.destinations" },
  { id: "thingToDo", labelKey: "agency.activitiesPage.thingsToDo" },
  { id: "food", labelKey: "agency.activitiesPage.restaurants" },
  { id: "stay", labelKey: "agency.activitiesPage.accommodations" },
];

const CATEGORY_OPTIONS: CategoryKey[] = ["destination", "thingToDo", "food", "stay"];

// ---------------------------------------------------------------------------
// Local form schema
// ---------------------------------------------------------------------------

const ActivityFormSchema = NewActivitySchema.extend({
  priceFrom: z.number().min(0, "Enter a price"),
  categoryType: z.string().optional(),
  highlights: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  cuisine: z.string().optional(),
  openingHours: z.string().optional(),
  roomTypes: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});
type ActivityFormValues = z.infer<typeof ActivityFormSchema>;

// ---------------------------------------------------------------------------
// Category icon
// ---------------------------------------------------------------------------

function ActivityCover({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category as CategoryKey] ?? CATEGORY_CONFIG.destination;
  const iconProps = { size: 22, color: "rgba(255,255,255,0.9)" };
  return (
    <div
      className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
      style={{ background: cfg.coverBg }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%)" }}
      />
      <span className="relative">
        {category === "destination" && <Location {...iconProps} variant="Bold" />}
        {category === "thingToDo" && <Flash {...iconProps} variant="Bold" />}
        {category === "food" && <Cup {...iconProps} variant="Bold" />}
        {category === "stay" && <Buildings {...iconProps} variant="Bold" />}
        {!["destination", "thingToDo", "food", "stay"].includes(category) && <Category {...iconProps} />}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type-specific form fields — uses @/ui Input/TextArea and semantic classes
// ---------------------------------------------------------------------------

function TypeSpecificFields({
  category,
  control,
  register,
}: {
  category: string;
  control: ReturnType<typeof useForm<ActivityFormValues>>["control"];
  register: ReturnType<typeof useForm<ActivityFormValues>>["register"];
}) {
  const { t } = useTranslation();

  if (category === "destination") {
    return (
      <>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.categoryType")}</Label>
          <Controller
            name="categoryType"
            control={control}
            render={({ field }) => (
              <Select
                aria-label={t("agency.activitiesPage.categoryType")}
                selectedKey={field.value ?? ""}
                onSelectionChange={(key) => { if (key !== null) field.onChange(key); }}
                onBlur={field.onBlur}
              >
                <Select.Trigger>
                  <Select.Value>
                    {({ selectedText }) =>
                      selectedText || t("agency.activitiesPage.categoryTypePlaceholder")
                    }
                  </Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {DESTINATION_CATEGORIES.map((c) => (
                      <ListBox.Item key={c} id={c} textValue={c}>{c}</ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.highlights")}</Label>
          <Controller
            name="highlights"
            control={control}
            render={({ field }) => (
              <TextArea
                className="min-h-[80px]"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                placeholder={t("agency.activitiesPage.highlightsPlaceholder")}
              />
            )}
          />
        </div>
      </>
    );
  }

  if (category === "thingToDo") {
    return (
      <>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.duration")}</Label>
          <Input {...register("duration")} placeholder={t("agency.activitiesPage.durationPlaceholder")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.difficulty")}</Label>
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => field.onChange(d)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                      field.value === d
                        ? d === "Easy"
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : d === "Medium"
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-red-400 bg-red-50 text-red-700"
                        : "border-border bg-surface text-muted hover:bg-content2"
                    }`}
                  >
                    {t(`agency.activitiesPage.difficulty${d}`)}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
      </>
    );
  }

  if (category === "food") {
    return (
      <>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.cuisine")}</Label>
          <Input {...register("cuisine")} placeholder={t("agency.activitiesPage.cuisinePlaceholder")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.openingHours")}</Label>
          <Input {...register("openingHours")} placeholder={t("agency.activitiesPage.openingHoursPlaceholder")} />
        </div>
      </>
    );
  }

  if (category === "stay") {
    return (
      <>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.roomTypes")}</Label>
          <Input {...register("roomTypes")} placeholder={t("agency.activitiesPage.roomTypesPlaceholder")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("agency.activitiesPage.amenities")}</Label>
          <Controller
            name="amenities"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-1.5">
                {AMENITY_OPTIONS.map((a) => {
                  const selected = (field.value ?? []).includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? (field.value ?? []).filter((x) => x !== a)
                            : [...(field.value ?? []), a],
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-surface text-muted hover:bg-content2"
                      }`}
                    >
                      {selected && <TickCircle size={12} color="currentColor" />}
                      {a}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
      </>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Activity form modal (create + edit)
// ---------------------------------------------------------------------------

function ActivityFormModal({
  isOpen,
  activity,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSubmit: (data: ActivityFormValues) => Promise<string | void>;
}) {
  const { t } = useTranslation();
  const isEdit = activity !== null;

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(ActivityFormSchema),
    defaultValues: {
      category: activity?.category ?? "destination",
      title: activity?.title ?? "",
      location: activity?.location ?? "",
      priceFrom: activity?.priceFrom ?? 0,
      description: activity?.description ?? "",
      difficulty: "Easy",
      amenities: [],
    },
  });

  // Re-populate when the modal opens or the target activity changes
  useEffect(() => {
    if (!isOpen) return;
    reset({
      category: activity?.category ?? "destination",
      title: activity?.title ?? "",
      location: activity?.location ?? "",
      priceFrom: activity?.priceFrom ?? 0,
      description: activity?.description ?? "",
      difficulty: "Easy",
      amenities: [],
    });
    setApiError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activity]);

  const category = watch("category");
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleFormSubmit(data: ActivityFormValues) {
    setApiError(null);
    const err = await onSubmit(data);
    if (err) setApiError(err);
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <Modal.Backdrop>
        <Modal.Container size="lg" placement="center" scroll="inside">
          <Modal.Dialog className="flex max-h-[90vh] flex-col">
            <Modal.Header className="flex flex-shrink-0 items-center gap-2">
              <Modal.Icon className="text-primary">
                {isEdit ? <Edit2 size={20} color="currentColor" /> : <Add size={20} color="currentColor" />}
              </Modal.Icon>
              <Modal.Heading>
                {isEdit
                  ? t("agency.activitiesPage.editTitle")
                  : t("agency.activitiesPage.createTitle")}
              </Modal.Heading>
            </Modal.Header>

            <Form
              validationBehavior="aria"
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Modal.Body className="flex flex-1 flex-col gap-5 overflow-y-auto">
                {/* Category selector */}
                <div className="flex flex-col gap-1.5">
                  <Label>{t("agency.activitiesPage.activityType")}</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        aria-label={t("agency.activitiesPage.activityType")}
                        selectedKey={field.value}
                        onSelectionChange={(key) => { if (key !== null) field.onChange(key); }}
                        onBlur={field.onBlur}
                      >
                        <Select.Trigger>
                          <Select.Value>
                            {({ selectedText }) =>
                              selectedText
                                ? t(CATEGORY_CONFIG[field.value as CategoryKey]?.labelKey ?? "")
                                : null
                            }
                          </Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {CATEGORY_OPTIONS.map((cat) => (
                              <ListBox.Item
                                key={cat}
                                id={cat}
                                textValue={t(CATEGORY_CONFIG[cat].labelKey)}
                              >
                                {t(CATEGORY_CONFIG[cat].labelKey)}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="activity-title">
                    {t("agency.activitiesPage.name")}
                    <span className="text-danger ml-0.5">*</span>
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
                        placeholder={t("agency.activitiesPage.namePlaceholder")}
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="text-danger text-sm" role="alert">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <Label>{t("agency.activitiesPage.description")}</Label>
                  <TextArea
                    {...register("description")}
                    className="min-h-[80px]"
                    placeholder={t("agency.activitiesPage.descriptionPlaceholder")}
                  />
                </div>

                {/* Province + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="activity-province">
                      {t("agency.activitiesPage.province")}
                      <span className="text-danger ml-0.5">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="location"
                      render={({ field }) => (
                        <Select
                          id="activity-province"
                          aria-label={t("agency.activitiesPage.province")}
                          selectedKey={field.value}
                          onSelectionChange={(key) => { if (key !== null) field.onChange(key); }}
                          onBlur={field.onBlur}
                        >
                          <Select.Trigger>
                            <Select.Value>
                              {({ selectedText }) =>
                                selectedText || t("agency.activitiesPage.provincePlaceholder")
                              }
                            </Select.Value>
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {PROVINCES.map((p) => (
                                <ListBox.Item key={p} id={p} textValue={p}>{p}</ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      )}
                    />
                    {errors.location && (
                      <p className="text-danger text-sm" role="alert">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="activity-price">
                      {t("agency.activitiesPage.price")}
                      <span className="text-danger ml-0.5">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="priceFrom"
                      render={({ field }) => (
                        <div className="relative">
                          <span className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">$</span>
                          <Input
                            id="activity-price"
                            type="number"
                            min="0"
                            value={String(field.value ?? "")}
                            onChange={(e) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                            onBlur={field.onBlur}
                            aria-invalid={Boolean(errors.priceFrom)}
                            className="pl-6"
                          />
                        </div>
                      )}
                    />
                    {errors.priceFrom && (
                      <p className="text-danger text-sm" role="alert">{errors.priceFrom.message}</p>
                    )}
                  </div>
                </div>

                {/* Cover image (UI-only) */}
                <div className="flex flex-col gap-1.5">
                  <Label>{t("agency.activitiesPage.coverImages")}</Label>
                  <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-content2 px-4 py-4 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5">
                    <DocumentUpload size={24} color="currentColor" className="text-muted" />
                    <p className="text-center text-sm text-muted">
                      {t("agency.activitiesPage.dropImages")}{" "}
                      <span className="text-primary font-medium">{t("agency.activitiesPage.browseFiles")}</span>
                    </p>
                    <p className="text-xs text-muted">{t("agency.activitiesPage.coverImagesHint")}</p>
                  </div>
                </div>

                {/* Type-specific fields */}
                <TypeSpecificFields category={category} control={control} register={register} />
              </Modal.Body>

              <Modal.Footer className="flex flex-shrink-0 items-center justify-between gap-2">
                {apiError ? (
                  <p className="text-danger text-sm flex-1">{apiError}</p>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="tertiary" onPress={onClose}>
                    {t("agency.activitiesPage.cancel")}
                  </Button>
                  <Button type="submit" variant="primary" isPending={isSubmitting}>
                    {isEdit ? t("agency.activitiesPage.saveChanges") : t("agency.activitiesPage.save")}
                  </Button>
                </div>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Request-edit modal
// ---------------------------------------------------------------------------

function RequestEditModal({
  activity,
  onClose,
}: {
  activity: Activity | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState("");

  return (
    <Modal
      isOpen={activity !== null}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <Modal.Backdrop>
        <Modal.Container size="md" placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-warning">
                <Lock1 size={20} color="currentColor" />
              </Modal.Icon>
              <Modal.Heading>{t("agency.activitiesPage.requestEditTitle")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <p className="text-muted text-sm">{t("agency.activitiesPage.requestEditInfo")}</p>
              {activity && (
                <p className="font-medium">{activity.title}</p>
              )}
              <div className="flex flex-col gap-1.5">
                <Label>{t("agency.activitiesPage.whatNeedsChange")}</Label>
                <TextArea
                  className="min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("agency.activitiesPage.requestEditInfo")}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="tertiary" onPress={onClose}>
                {t("agency.activitiesPage.cancel")}
              </Button>
              <Button variant="primary" onPress={onClose}>
                {t("agency.activitiesPage.submit")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Activity row
// ---------------------------------------------------------------------------

function ActivityRow({
  activity,
  confirmingId,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onRequestEdit,
}: {
  activity: Activity;
  confirmingId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onRequestEdit: () => void;
}) {
  const { t } = useTranslation();
  const isConfirming = confirmingId === activity.id;

  return (
    <li className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
      {/* Left: cover + info */}
      <div className="flex min-w-0 items-center gap-3">
        <ActivityCover category={activity.category} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium truncate">{activity.title}</p>
            <StatusChip status={activity.status} />
            {activity.locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                <Lock size={10} color="currentColor" />
                {t("agency.activitiesPage.adminLocked")}
              </span>
            )}
          </div>
          <p className="text-muted mt-0.5 text-sm">
            {t(CATEGORY_CONFIG[activity.category as CategoryKey]?.labelKey ?? "")}
            {" · "}
            <span className="inline-flex items-center gap-1">
              <Location size={12} color="currentColor" />
              {activity.location}
            </span>
            {" · "}
            <span className="font-medium">${activity.priceFrom}</span>
            <span className="text-muted"> {t("agency.activitiesPage.perPerson")}</span>
            {activity.rating > 0 && (
              <span className="text-warning ml-1 font-medium">★ {activity.rating}</span>
            )}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isConfirming ? (
          <>
            <span className="text-muted text-xs">{t("agency.activitiesPage.deleteConfirm")}</span>
            <Button
              variant="primary"
              size="sm"
              className="text-danger"
              onPress={onConfirmDelete}
            >
              {t("agency.activitiesPage.delete")}
            </Button>
            <Button variant="tertiary" size="sm" onPress={onCancelDelete}>
              <CloseCircle size={16} color="currentColor" />
            </Button>
          </>
        ) : (
          <>
            {activity.locked ? (
              <Button
                variant="secondary"
                size="sm"
                onPress={onRequestEdit}
              >
                <Lock1 size={15} color="currentColor" />
                {t("agency.activitiesPage.requestEdit")}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onPress={onEdit}>
                <Edit2 size={15} color="currentColor" />
                {t("agency.activitiesPage.edit")}
              </Button>
            )}
            <Button
              variant="tertiary"
              size="sm"
              className="text-danger"
              onPress={onDelete}
            >
              <Trash size={15} color="currentColor" />
              {t("agency.activitiesPage.delete")}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ActivitiesContent() {
  const { t } = useTranslation();

  const activities     = useAgencyStore((s) => s.activities);
  const setActivities  = useAgencyStore((s) => s.setActivities);

  const [activeTab, setActiveTab]   = useState<TabId>("all");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editActivity, setEditActivity]           = useState<Activity | null>(null);
  const [requestEditTarget, setRequestEditTarget] = useState<Activity | null>(null);
  const [confirmingId, setConfirmingId]           = useState<string | null>(null);

  // province → first owned destination id (needed for creating sub-items)
  const destByProvinceRef = useRef<Record<string, string>>({});

  useEffect(() => {
    getActivities().then((result) => {
      if (result.ok) {
        setActivities(result.data.activities);
        destByProvinceRef.current = result.data.destByProvince;
      } else {
        setLoadError(true);
      }
      setLoading(false);
    });
  }, [setActivities]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activities.filter((a) => {
      const matchTab = activeTab === "all" || a.category === activeTab;
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [activities, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  async function handleCreate(data: ActivityFormValues): Promise<string | void> {
    const input: NewActivityInput = {
      title: data.title,
      category: data.category,
      location: data.location,
      priceFrom: data.priceFrom,
      description: data.description,
    };
    const destId =
      input.category === "destination"
        ? null
        : (destByProvinceRef.current[input.location] ?? Object.values(destByProvinceRef.current)[0] ?? null);
    if (input.category !== "destination" && !destId) {
      return "Create a Destination first — activities, restaurants, and accommodations must belong to a destination in the same province.";
    }
    const result = await createAgencyActivity(input, destId);
    if (!result.ok) {
      return result.message ?? "Failed to create activity. Please try again.";
    }
    const listResult = await getActivities();
    if (listResult.ok) {
      setActivities(listResult.data.activities);
      destByProvinceRef.current = listResult.data.destByProvince;
    } else {
      setActivities([result.data, ...activities]);
    }
    setCreateOpen(false);
  }

  async function handleEdit(data: ActivityFormValues): Promise<string | void> {
    if (!editActivity) return;
    const input: NewActivityInput = {
      title: data.title,
      category: data.category,
      location: data.location,
      priceFrom: data.priceFrom,
      description: data.description,
    };
    const result = await updateAgencyActivity(editActivity.id, editActivity.category, input);
    if (!result.ok) {
      return result.message ?? "Failed to save changes. Please try again.";
    }
    const listResult = await getActivities();
    if (listResult.ok) {
      setActivities(listResult.data.activities);
      destByProvinceRef.current = listResult.data.destByProvince;
    } else {
      setActivities(activities.map((a) => (a.id === editActivity.id ? result.data : a)));
    }
    setEditActivity(null);
  }

  function handleConfirmDelete(activity: Activity) {
    setIsDeleting(activity.id);
    deleteAgencyActivity(activity.id, activity.category).then(async (result) => {
      if (result.ok) {
        const listResult = await getActivities();
        if (listResult.ok) {
          setActivities(listResult.data.activities);
          destByProvinceRef.current = listResult.data.destByProvince;
        } else {
          setActivities(activities.filter((a) => a.id !== activity.id));
        }
      }
      setIsDeleting(null);
      setConfirmingId(null);
    });
  }

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{ color: "var(--primary-lightskyblue)" }}
          >
            {t("agency.activitiesPage.pageTitle")}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {t("agency.activitiesPage.subtitle")}
          </p>
        </div>
        <Button variant="primary" onPress={() => setCreateOpen(true)}>
          <Add size={18} color="currentColor" />
          {t("agency.activitiesPage.createNewActivity")}
        </Button>
      </header>

      {/* Filter tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const count =
            tab.id === "all"
              ? activities.length
              : activities.filter((a) => a.category === tab.id).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
              style={{ marginBottom: -1 }}
            >
              {t(tab.labelKey)}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
                  isActive ? "bg-primary text-white" : "bg-content2 text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <SearchField
        value={search}
        onChange={handleSearchChange}
        aria-label={t("agency.activitiesPage.search")}
        className="max-w-sm"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t("agency.activitiesPage.search")} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {/* List */}
      {loading ? (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="bg-surface border-border flex items-center gap-3 rounded-xl border p-4">
              <Skeleton className="h-14 w-14 flex-shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-foreground font-semibold">{t("common.error")}</p>
          <Button variant="secondary" onPress={() => {
            setLoadError(false);
            setLoading(true);
            getActivities().then((result) => {
              if (result.ok) {
                setActivities(result.data.activities);
                destByProvinceRef.current = result.data.destByProvince;
              } else {
                setLoadError(true);
              }
              setLoading(false);
            });
          }}>
            {t("common.retry")}
          </Button>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="bg-content2 text-muted inline-flex h-14 w-14 items-center justify-center rounded-2xl">
            <Category size={32} color="currentColor" />
          </span>
          <p className="text-foreground font-semibold">{t("agency.activitiesPage.emptyNoActivities")}</p>
          <p className="text-muted max-w-xs text-sm">{t("agency.activitiesPage.emptyCreateFirst")}</p>
          <Button variant="primary" onPress={() => setCreateOpen(true)}>
            <Add size={16} color="currentColor" />
            {t("agency.activitiesPage.createNewActivity")}
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {paginated.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              confirmingId={isDeleting === a.id ? a.id : confirmingId}
              onEdit={() => setEditActivity(a)}
              onDelete={() => setConfirmingId(a.id)}
              onConfirmDelete={() => handleConfirmDelete(a)}
              onCancelDelete={() => setConfirmingId(null)}
              onRequestEdit={() => setRequestEditTarget(a)}
            />
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="tertiary"
              size="sm"
              isDisabled={currentPage <= 1}
              onPress={() => setPage(currentPage - 1)}
            >
              <ArrowLeft2 size={16} color="currentColor" />
              {t("agency.activitiesPage.prevPage")}
            </Button>
            <span className="text-muted text-sm">{currentPage} / {totalPages}</span>
            <Button
              variant="tertiary"
              size="sm"
              isDisabled={currentPage >= totalPages}
              onPress={() => setPage(currentPage + 1)}
            >
              {t("agency.activitiesPage.nextPage")}
              <ArrowRight2 size={16} color="currentColor" />
            </Button>
          </div>
        </div>
      )}

      {/* Create modal */}
      <ActivityFormModal
        isOpen={createOpen}
        activity={null}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit modal */}
      <ActivityFormModal
        isOpen={editActivity !== null}
        activity={editActivity}
        onClose={() => setEditActivity(null)}
        onSubmit={handleEdit}
      />

      {/* Request-edit modal */}
      <RequestEditModal
        activity={requestEditTarget}
        onClose={() => setRequestEditTarget(null)}
      />
    </div>
  );
}
