"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Location } from "iconsax-reactjs";
import {
  Autocomplete,
  Button,
  Checkbox,
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
<<<<<<< HEAD
import { ProvinceSchema, TravelTypeSchema } from "@/features/destinations/schema";
=======
import { useSession } from "@/lib/auth";
import {
  CAMBODIA_PROVINCE_CODES,
  TravelTypeSchema,
} from "@/features/destinations/schema";
>>>>>>> 2d673ed7538579d7af67789c239619f46f219203
import {
  NewDestinationSchema,
  type NewDestinationFormValues,
  type NewDestinationInput,
} from "../schema";
<<<<<<< HEAD
import { createDestinationAction } from "../actions";
import type { DestinationRequest } from "@/lib/api/activities";
=======
import type { DestinationResponse } from "@/lib/api/destinations";
import type { Province, TravelType } from "@/lib/api/client";
import { createDestinationAction } from "../actions";
import { useToursStore } from "../store";
>>>>>>> 2d673ed7538579d7af67789c239619f46f219203

const PROVINCES = CAMBODIA_PROVINCE_CODES;
const TRAVEL_TYPES = TravelTypeSchema.options;

const DEFAULTS: NewDestinationFormValues = {
  name: "",
  description: "",
  shortDescription: "",
  province: "SIEM_REAP",
  travelType: "HISTORICAL",
  coverImageUrl: "",
  priceFrom: 0,
  currency: "USD",
  latitude: 0,
  longitude: 0,
  featured: false,
  trending: false,
  tags: "",
  photos: "",
};

type Props = {
  /** Controls modal visibility. */
  isOpen: boolean;
  onClose: () => void;
<<<<<<< HEAD
  /** Called after a successful create — e.g. to refresh the server-fetched list. */
  onCreated?: () => void;
};

/**
 * Create-destination modal. Submits POST /destinations via a server action and
 * calls `onCreated` so the caller can refresh. Shared by the agency tours panel
 * and the admin content manager.
 */
export function DestinationForm({ isOpen, onClose, onCreated }: Props) {
=======
  /** When set, creates via API and calls back with the response. */
  onCreated?: (dest: DestinationResponse) => void;
};

/** Create-destination modal. Shared by the agency tours panel and admin manager. */
export function DestinationForm({ isOpen, origin, ownerName, onClose, onCreated }: Props) {
>>>>>>> 2d673ed7538579d7af67789c239619f46f219203
  const { t } = useTranslation();
  const { contains } = useFilter({ sensitivity: "base" });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewDestinationFormValues, unknown, NewDestinationInput>({
    resolver: zodResolver(NewDestinationSchema),
    defaultValues: DEFAULTS,
  });

  // Reset to a clean form each time the modal opens.
  useEffect(() => {
    if (isOpen) reset(DEFAULTS);
  }, [isOpen, reset]);

<<<<<<< HEAD
  const handleClose = () => {
    setSubmitError(null);
=======
  const onSubmit = async (values: NewDestinationInput) => {
    if (onCreated) {
      const dest = await createDestinationAction({
        name: values.name,
        description: values.description,
        province: values.province as Province,
        travelType: values.travelType as TravelType,
        coverImageUrl: values.coverImageUrl,
        priceFrom: values.priceFrom,
        currency: values.currency,
        latitude: values.latitude,
        longitude: values.longitude,
      });
      onCreated(dest);
      onClose();
      return;
    }

    addDestination(role, values, origin, ownerName);
>>>>>>> 2d673ed7538579d7af67789c239619f46f219203
    onClose();
  };

  const onSubmit = async (values: NewDestinationInput) => {
    setSubmitError(null);
    const body: DestinationRequest = {
      name: values.name,
      description: values.description,
      shortDescription: values.shortDescription,
      province: values.province,
      travelType: values.travelType,
      coverImageUrl: values.coverImageUrl,
      priceFrom: values.priceFrom,
      currency: values.currency,
      latitude: values.latitude,
      longitude: values.longitude,
      featured: values.featured,
      trending: values.trending,
      tags: values.tags,
      photos: values.photos,
    };
    const result = await createDestinationAction(body);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    onCreated?.();
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Modal.Backdrop>
        <Modal.Container size="lg" placement="center" className="w-full sm:max-w-3xl">
          <Modal.Dialog className="w-full sm:max-w-3xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-primary">
                <Location size={20} color="currentColor" />
              </Modal.Icon>
              <Modal.Heading>{t("tours.destinations.form.title")}</Modal.Heading>
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
                  <Label htmlFor="d-short">{t("tours.destinations.form.shortDescription")}</Label>
                  <Controller
                    control={control}
                    name="shortDescription"
                    render={({ field }) => (
                      <Input
                        id="d-short"
                        placeholder={t("tours.destinations.form.shortDescriptionPlaceholder")}
                        aria-invalid={Boolean(errors.shortDescription)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.shortDescription ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.shortDescription.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-cover">{t("tours.destinations.form.coverImageUrl")}</Label>
                  <Controller
                    control={control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <Input
                        id="d-cover"
                        type="url"
                        placeholder={t("tours.destinations.form.coverImageUrlPlaceholder")}
                        aria-invalid={Boolean(errors.coverImageUrl)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.coverImageUrl ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.coverImageUrl.message}
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
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.tags ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.tags.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-photos">{t("tours.destinations.form.photos")}</Label>
                  <Controller
                    control={control}
                    name="photos"
                    render={({ field }) => (
                      <TextArea
                        id="d-photos"
                        placeholder={t("tours.destinations.form.photosPlaceholder")}
                        aria-invalid={Boolean(errors.photos)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.photos ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.photos.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                  <Controller
                    control={control}
                    name="featured"
                    render={({ field }) => (
                      <Checkbox
                        isSelected={field.value}
                        onChange={field.onChange}
                        name={field.name}
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content className="text-sm">
                          {t("tours.destinations.form.featured")}
                        </Checkbox.Content>
                      </Checkbox>
                    )}
                  />
                  <Controller
                    control={control}
                    name="trending"
                    render={({ field }) => (
                      <Checkbox
                        isSelected={field.value}
                        onChange={field.onChange}
                        name={field.name}
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content className="text-sm">
                          {t("tours.destinations.form.trending")}
                        </Checkbox.Content>
                      </Checkbox>
                    )}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {submitError ? (
                  <p className="text-danger mr-auto text-sm" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <Button type="button" variant="tertiary" onPress={handleClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" variant="primary" isPending={isSubmitting}>
                  {t("tours.destinations.form.submit")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
