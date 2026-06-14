"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Location } from "iconsax-reactjs";
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
import { useToursStore } from "../store";

const PROVINCES = CAMBODIA_PROVINCE_CODES;
const TRAVEL_TYPES = TravelTypeSchema.options;

const DEFAULTS: NewDestinationFormValues = {
  name: "",
  description: "",
  province: "SIEM_REAP",
  travelType: "HISTORICAL",
  coverImageUrl: "",
  priceFrom: 0,
  currency: "USD",
  latitude: 0,
  longitude: 0,
};

type Props = {
  /** Controls modal visibility. */
  isOpen: boolean;
  /** Marks the created destination as admin- or agency-owned (Flow 1 vs Flow 2). */
  origin: DestinationOrigin;
  /** Display name stored as the destination owner. */
  ownerName: string;
  onClose: () => void;
};

/** Create-destination modal. Shared by the agency tours panel and admin manager. */
export function DestinationForm({ isOpen, origin, ownerName, onClose }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const addDestination = useToursStore((s) => s.addDestination);
  const { contains } = useFilter({ sensitivity: "base" });

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

  const onSubmit = (values: NewDestinationInput) => {
    addDestination(role, values, origin, ownerName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
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
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" onPress={onClose}>
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
