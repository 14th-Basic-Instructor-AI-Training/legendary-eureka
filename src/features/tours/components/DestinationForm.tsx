"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { DocumentUpload, Location, Trash } from "iconsax-reactjs";
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
  TravelTypeSchema,
} from "@/features/destinations/schema";
import {
  NewDestinationSchema,
  type DestinationOrigin,
  type NewDestinationFormValues,
  type NewDestinationInput,
} from "../schema";
import type { DestinationResponse } from "@/lib/api/destinations";
import type { Province, TravelType } from "@/lib/api/client";
import { sileo } from "sileo";
import { createDestinationAction, updateDestinationAction } from "@/actions/tours";
import { uploadFileWithProgress, uploadFilesWithProgress } from "@/lib/api/upload-client";
import { UploadProgressContent } from "./UploadProgressToast";
import { useUploadProgressStore } from "../uploadProgressStore";
import { useToursStore } from "../store";

/** A photo in the grid — a freshly picked `file` (object-URL preview) or an
 *  already-uploaded `fileName` carried over when editing. */
type PhotoItem = { key: string; url: string; file?: File; fileName?: string };

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Minimum time each upload step stays on screen. Local uploads finish in a few
 *  ms, so without a floor the cover/photos steps would flash past invisibly —
 *  this keeps the morph + progress animation perceptible regardless of speed. */
const MIN_STEP_MS = 700;

/** Run `work` but keep its step visible for at least `MIN_STEP_MS`. */
async function withMinDuration<T>(work: Promise<T>): Promise<T> {
  const [result] = await Promise.all([work, delay(MIN_STEP_MS)]);
  return result;
}

// The upload pipeline runs through a single shared Sileo toast + phase store
// (one at a time), so its id and pending auto-dismiss timer live at module scope.
// This also keeps these reads/writes out of render — a `useRef` accessed from the
// submit handler trips the compiler's "refs during render" rule — and lets either
// DestinationForm instance (create / edit) clean up the other's leftover toast.
let activeUploadToastId: string | null = null;
let uploadDismissTimer: ReturnType<typeof setTimeout> | null = null;

/** Show the single persistent upload toast and remember its id. Keeping the
 *  module-state write here (not inline in the component) satisfies the compiler,
 *  which forbids reassigning module bindings from render/handler code. */
function showUploadToast(body: ReactNode): string {
  const id = sileo.show({
    duration: null,
    position: "top-center",
    icon: null,
    description: body,
  });
  activeUploadToastId = id;
  return id;
}

/** Cancel a pending auto-dismiss (so it can't remove a fresh toast). */
function cancelUploadDismiss() {
  if (uploadDismissTimer) {
    clearTimeout(uploadDismissTimer);
    uploadDismissTimer = null;
  }
}

/** Cancel any pending dismiss and remove the active toast outright. */
function clearUploadToast() {
  cancelUploadDismiss();
  if (activeUploadToastId) {
    sileo.dismiss(activeUploadToastId);
    activeUploadToastId = null;
  }
}

/** Auto-dismiss the result toast after `ms`, superseding any pending dismiss. */
function scheduleUploadDismiss(toastId: string, ms: number) {
  cancelUploadDismiss();
  uploadDismissTimer = setTimeout(() => {
    sileo.dismiss(toastId);
    uploadDismissTimer = null;
    if (activeUploadToastId === toastId) activeUploadToastId = null;
  }, ms);
}

const PROVINCES = CAMBODIA_PROVINCE_CODES;
const TRAVEL_TYPES = TravelTypeSchema.options;

const DEFAULTS: NewDestinationFormValues = {
  name: "",
  description: "",
  province: "SIEM_REAP",
  travelType: "HISTORICAL",
  coverImageUrl: "",
  // Required numeric fields start blank (not 0) so they read as empty and the
  // user must enter a value — see `blankToUndefined` in schema.ts.
  priceFrom: "",
  currency: "USD",
  latitude: "",
  longitude: "",
  tags: "",
  photos: [],
};

type Props = {
  /** Controls modal visibility. */
  isOpen: boolean;
  /** When set, the modal edits this destination (PUT) instead of creating one. */
  destination?: DestinationResponse;
  /** Marks the created destination as admin- or agency-owned (Flow 1 vs Flow 2). */
  origin?: DestinationOrigin;
  /** Display name stored as the destination owner. */
  ownerName?: string;
  onClose: () => void;
  /** When set, creates via API and calls back with the response. */
  onCreated?: (dest: DestinationResponse) => void;
  /** Called after a successful edit so the caller can refresh. */
  onSaved?: () => void;
};

/** Map an existing destination onto the create/edit form's input shape. */
function toFormValues(d: DestinationResponse): NewDestinationFormValues {
  return {
    name: d.name,
    description: d.description,
    // The API enums are wider than the form's options — narrow with a cast.
    province: d.province as NewDestinationFormValues["province"],
    travelType: d.travelType as NewDestinationFormValues["travelType"],
    coverImageUrl: d.coverImageUrl,
    priceFrom: d.priceFrom,
    currency: d.currency,
    latitude: d.latitude,
    longitude: d.longitude,
    tags: (d.tags ?? []).join(", "),
    photos: d.photos ?? [],
  };
}

/** Create- or edit-destination modal. Shared by the agency tours panel and admin manager. */
export function DestinationForm({
  isOpen,
  destination,
  origin,
  ownerName,
  onClose,
  onCreated,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const addDestination = useToursStore((s) => s.addDestination);
  const { contains } = useFilter({ sensitivity: "base" });
  const isEditing = Boolean(destination);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewDestinationFormValues, unknown, NewDestinationInput>({
    resolver: zodResolver(NewDestinationSchema),
    defaultValues: DEFAULTS,
  });

  // Upload UI state. Files are picked here but NOT uploaded yet — only previewed.
  // The actual uploads run when the form is submitted (see `onSubmit`), surfaced
  // step-by-step in the progress toast. The RHF `coverImageUrl` / `photos` fields
  // hold placeholder values purely so Zod's "required"/"max" rules still gate the
  // submit; the real file names are resolved from the upload responses.
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const photosInputRef = useRef<HTMLInputElement>(null);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const keyCounter = useRef(0);
  const nextKey = () => `p${keyCounter.current++}`;

  // The morphing progress toast (cover → photos → create) is a Sileo toast whose
  // body reads this store; the form drives it via `setPhase`.
  const phase = useUploadProgressStore((s) => s.phase);
  const setPhase = useUploadProgressStore((s) => s.setPhase);
  const setEditing = useUploadProgressStore((s) => s.setEditing);
  const isBusy = phase !== null && phase.step !== "error";

  // Seed the form when the modal opens — the edit target's values, or a clean slate.
  useEffect(() => {
    if (isOpen) reset(destination ? toFormValues(destination) : DEFAULTS);
  }, [isOpen, destination, reset]);

  // Seed/clear image previews when the modal opens or switches target. Adjusting
  // state during render (React's recommended pattern for "reset state on prop
  // change") keeps it out of an effect. On edit, existing stored values double as
  // their own preview source and carry their file name for re-submission.
  const seedKey = isOpen ? (destination?.id ?? "new") : "closed";
  const [seededFor, setSeededFor] = useState("closed");
  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setCoverFile(null);
    setCoverPreview(destination?.coverImageUrl || null);
    // Stable keys for seeded photos (index-based) — the ref counter is reserved
    // for runtime additions, which happen in event handlers, not during render.
    setPhotoItems((destination?.photos ?? []).map((p, i) => ({ key: `existing-${i}`, url: p, fileName: p })));
  }

  // Reset the progress toast's phase when the modal OPENS or switches target —
  // not on close, so the final "done" toast survives after onClose(). Also drop
  // any leftover result toast from a previous run so it can't linger blank once
  // the phase is cleared. Writing to the shared store must happen in an effect,
  // never during render (that updates other store subscribers mid-render → the
  // "Cannot update a component while rendering a different component" warning).
  useEffect(() => {
    if (seedKey === "closed") return;
    setPhase(null);
    clearUploadToast();
  }, [seedKey, setPhase]);

  const onSubmit = async (values: NewDestinationInput) => {
    setEditing(isEditing);
    // A new run supersedes any pending auto-dismiss from a previous one.
    cancelUploadDismiss();
    const newFiles = photoItems.filter((it) => it.file).map((it) => it.file as File);
    setPhase(
      coverFile
        ? { step: "cover", percent: 0 }
        : newFiles.length > 0
          ? { step: "photos", percent: 0 }
          : { step: "create" },
    );
    // ONE persistent toast hosts the entire pipeline. cover → photos → create →
    // done/error all flow through the phase store and re-render THIS toast's body
    // in place — never a second `sileo.*` call, so the toast keeps the same
    // instanceId and never replays its enter animation (no close-then-reopen
    // flash). We dismiss it ourselves once the result has been shown.
    const toastId = showUploadToast(<UploadProgressContent />);

    try {
      // Step 1 — cover image. Only upload if a new file was picked; otherwise an
      // edit reuses the existing file name.
      let coverImageUrl = destination?.coverImageUrl ?? "";
      if (coverFile) {
        setPhase({ step: "cover", percent: 0 });
        const uploaded = await withMinDuration(
          uploadFileWithProgress(coverFile, (percent) => setPhase({ step: "cover", percent })),
        );
        // Store the public URL the upload returns — the backend persists/serves
        // it directly and validates `photos` as URLs (`fileName` is just the
        // original client filename, not retrievable).
        coverImageUrl = uploaded.url;
        setPhase({ step: "cover", percent: 100 });
        await delay(300);
      }

      // Step 2 — photos. Upload the newly picked files in one request, then weave
      // their URLs back into the grid order (existing ones pass through).
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        setPhase({ step: "photos", percent: 0 });
        const results = await withMinDuration(
          uploadFilesWithProgress(newFiles, (percent) => setPhase({ step: "photos", percent })),
        );
        uploadedUrls = results.map((r) => r.url);
        setPhase({ step: "photos", percent: 100 });
        await delay(300);
      }
      let nextUploaded = 0;
      const photos = photoItems
        .map((it) => (it.file ? uploadedUrls[nextUploaded++] : it.fileName ?? ""))
        .filter(Boolean);

      // Step 3 — persist the destination with the resolved URLs.
      setPhase({ step: "create" });
      const body = {
        name: values.name,
        description: values.description,
        province: values.province as Province,
        travelType: values.travelType as TravelType,
        coverImageUrl,
        priceFrom: values.priceFrom,
        currency: values.currency,
        latitude: values.latitude,
        longitude: values.longitude,
        tags: values.tags,
        photos,
      };

      if (destination) {
        // The backend PUT body maps to a record with primitive `featured`/`trending`
        // booleans — omitting them fails JSON deserialization ("Malformed request
        // body"). Carry the destination's current values so an edit preserves them.
        await withMinDuration(
          updateDestinationAction(destination.id, {
            ...body,
            featured: destination.featured,
            trending: destination.trending,
          }),
        );
        setPhase({ step: "done", name: values.name });
        scheduleUploadDismiss(toastId, 5000);
        onSaved?.();
        onClose();
        return;
      }

      if (onCreated) {
        const dest = await withMinDuration(createDestinationAction(body));
        setPhase({ step: "done", name: values.name });
        scheduleUploadDismiss(toastId, 5000);
        onCreated(dest);
        onClose();
        return;
      }

      addDestination(role, { ...values, coverImageUrl, photos }, origin ?? "agency", ownerName ?? "");
      setPhase({ step: "done", name: values.name });
      scheduleUploadDismiss(toastId, 5000);
      onClose();
    } catch (e) {
      // Morph the same toast to its error state (no second toast) and leave the
      // modal open so the user can retry; dismiss after a slightly longer beat.
      setPhase({ step: "error", message: e instanceof Error ? e.message : "" });
      scheduleUploadDismiss(toastId, 6000);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && !isBusy && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="lg" placement="center" className="w-full sm:max-w-3xl">
          <Modal.Dialog className="w-full sm:max-w-3xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-primary">
                <Location size={20} color="currentColor" />
              </Modal.Icon>
              <Modal.Heading>
                {t(isEditing ? "tours.destinations.form.editTitle" : "tours.destinations.form.title")}
              </Modal.Heading>
            </Modal.Header>

            <Form
              className="flex flex-col"
              validationBehavior="aria"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Modal.Body className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-name">{t("tours.destinations.form.name")}</Label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        id="d-name"
                        placeholder={t("tours.destinations.form.namePlaceholder")}
                        aria-invalid={Boolean(errors.name)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.name ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="province"
                    render={({ field }) => (
                      <Autocomplete
                        className="flex flex-col gap-1.5"
                        aria-label={t("tours.destinations.form.province")}
                        selectionMode="single"
                        value={field.value}
                        onChange={(key) => {
                          if (key != null && !Array.isArray(key)) field.onChange(String(key));
                        }}
                      >
                        <Label>{t("tours.destinations.form.province")}</Label>
                        <Autocomplete.Trigger>
                          <Autocomplete.Value />
                          <Autocomplete.Indicator className="text-text-input-color" />
                        </Autocomplete.Trigger>
                        <Autocomplete.Popover>
                          <Autocomplete.Filter filter={contains}>
                            <SearchField autoFocus name="province-search" variant="secondary">
                              <SearchField.Group>
                                <SearchField.SearchIcon />
                                <SearchField.Input
                                  placeholder={t("tours.destinations.form.searchProvince")}
                                />
                                <SearchField.ClearButton />
                              </SearchField.Group>
                            </SearchField>
                            <ListBox
                              renderEmptyState={() => (
                                <EmptyState>{t("tours.destinations.form.noProvince")}</EmptyState>
                              )}
                            >
                              {PROVINCES.map((p) => (
                                <ListBox.Item
                                  key={p}
                                  id={p}
                                  textValue={t(`destinations.provinces.${p}`)}
                                >
                                  {t(`destinations.provinces.${p}`)}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Autocomplete.Filter>
                        </Autocomplete.Popover>
                      </Autocomplete>
                    )}
                  />

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-travel">{t("tours.destinations.form.travelType")}</Label>
                    <Controller
                      control={control}
                      name="travelType"
                      render={({ field }) => (
                        <Select
                          id="d-travel"
                          aria-label={t("tours.destinations.form.travelType")}
                          selectedKey={field.value}
                          onSelectionChange={(key) => key !== null && field.onChange(key)}
                          onBlur={field.onBlur}
                        >
                          <Select.Trigger>
                            <Select.Value>
                              {() => t(`destinations.travelTypes.${field.value}`)}
                            </Select.Value>
                            <Select.Indicator className="text-text-input-color" />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {TRAVEL_TYPES.map((tt) => (
                                <ListBox.Item
                                  key={tt}
                                  id={tt}
                                  textValue={t(`destinations.travelTypes.${tt}`)}
                                >
                                  {t(`destinations.travelTypes.${tt}`)}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-description">{t("tours.destinations.form.description")}</Label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <TextArea
                        id="d-description"
                        placeholder={t("tours.destinations.form.descriptionPlaceholder")}
                        aria-invalid={Boolean(errors.description)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.description ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{t("tours.destinations.form.coverImage")}</Label>
                  <Controller
                    control={control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            setCoverFile(file);
                            setCoverPreview(URL.createObjectURL(file));
                            // Placeholder so Zod's required-cover rule passes; the
                            // real file name is resolved on submit after upload.
                            field.onChange(file.name);
                          }}
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => coverInputRef.current?.click()}
                          className="border-border bg-bg-ghostwhite hover:border-primary flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors disabled:opacity-60"
                        >
                          {coverPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coverPreview}
                              alt=""
                              className="h-28 w-full rounded-lg object-cover"
                            />
                          ) : (
                            <>
                              <DocumentUpload size={26} color="currentColor" className="text-muted" />
                              <span className="text-muted text-sm">
                                {t("tours.destinations.form.uploadCta")}
                              </span>
                              <span className="text-muted text-xs">
                                {t("tours.destinations.form.uploadHint")}
                              </span>
                            </>
                          )}
                        </button>
                        {coverPreview ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => coverInputRef.current?.click()}
                            className="text-primary self-start text-xs font-medium disabled:opacity-60"
                          >
                            {t("tours.destinations.form.changeImage")}
                          </button>
                        ) : null}
                      </>
                    )}
                  />
                  {errors.coverImageUrl ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.coverImageUrl.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{t("tours.destinations.form.photos")}</Label>
                  <Controller
                    control={control}
                    name="photos"
                    render={({ field }) => {
                      // Keep the RHF array in sync with the grid so Zod can count
                      // them; the placeholder strings are replaced on submit.
                      const sync = (items: PhotoItem[]) =>
                        field.onChange(items.map((it) => it.fileName ?? it.key));
                      return (
                        <>
                          <input
                            ref={photosInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              e.target.value = "";
                              if (files.length === 0) return;
                              const additions = files.map((f) => ({
                                key: nextKey(),
                                url: URL.createObjectURL(f),
                                file: f,
                              }));
                              const next = [...photoItems, ...additions].slice(0, 10);
                              setPhotoItems(next);
                              sync(next);
                            }}
                          />
                          {photoItems.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                              {photoItems.map((p, i) => (
                                <div key={p.key} className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={p.url}
                                    alt=""
                                    className="h-20 w-full rounded-lg object-cover"
                                  />
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    aria-label={t("tours.destinations.form.removePhoto")}
                                    onClick={() => {
                                      if (p.file) URL.revokeObjectURL(p.url);
                                      const next = photoItems.filter((_, idx) => idx !== i);
                                      setPhotoItems(next);
                                      sync(next);
                                    }}
                                    className="bg-danger absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-white disabled:opacity-60"
                                  >
                                    <Trash size={14} color="currentColor" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          <button
                            type="button"
                            disabled={isBusy || photoItems.length >= 10}
                            onClick={() => photosInputRef.current?.click()}
                            className="border-border bg-bg-ghostwhite hover:border-primary flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 transition-colors disabled:opacity-60"
                          >
                            <DocumentUpload size={20} color="currentColor" className="text-muted" />
                            <span className="text-muted text-sm">
                              {t("tours.destinations.form.addPhotos")}
                            </span>
                          </button>
                          <span className="text-muted text-xs">
                            {t("tours.destinations.form.photosHint")}
                          </span>
                        </>
                      );
                    }}
                  />
                  {errors.photos ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.photos.message as string}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-price">{t("tours.destinations.form.price")}</Label>
                    <Controller
                      control={control}
                      name="priceFrom"
                      render={({ field }) => (
                        <Input
                          id="d-price"
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

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-currency">{t("tours.destinations.form.currency")}</Label>
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <Input
                          id="d-currency"
                          placeholder="USD"
                          aria-invalid={Boolean(errors.currency)}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    {errors.currency ? (
                      <p className="text-danger text-sm" role="alert">
                        {errors.currency.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-lat">{t("tours.destinations.form.latitude")}</Label>
                    <Controller
                      control={control}
                      name="latitude"
                      render={({ field }) => (
                        <Input
                          id="d-lat"
                          type="number"
                          step="any"
                          aria-invalid={Boolean(errors.latitude)}
                          value={String(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    {errors.latitude ? (
                      <p className="text-danger text-sm" role="alert">
                        {errors.latitude.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-lng">{t("tours.destinations.form.longitude")}</Label>
                    <Controller
                      control={control}
                      name="longitude"
                      render={({ field }) => (
                        <Input
                          id="d-lng"
                          type="number"
                          step="any"
                          aria-invalid={Boolean(errors.longitude)}
                          value={String(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    {errors.longitude ? (
                      <p className="text-danger text-sm" role="alert">
                        {errors.longitude.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-tags">{t("tours.destinations.form.tags")}</Label>
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <Input
                        id="d-tags"
                        placeholder={t("tours.destinations.form.tagsPlaceholder")}
                        aria-invalid={Boolean(errors.tags)}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.tags ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.tags.message as string}
                    </p>
                  ) : null}
                </div>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" onPress={onClose} isDisabled={isBusy}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" variant="primary" isPending={isSubmitting || isBusy}>
                  {t(isEditing ? "tours.destinations.form.editSubmit" : "tours.destinations.form.submit")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
