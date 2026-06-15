"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Card, Form, Input, Label, ListBox, Select } from "@/ui";
import { CAMBODIA_PROVINCE_CODES, TravelTypeSchema } from "@/features/destinations/schema";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { Province, TravelType } from "@/lib/api/client";
import { createPackageAction } from "../actions";
import type { DestinationResponse } from "@/lib/api/destinations";
import {
  NewPackageSchema,
  type NewPackageFormValues,
  type NewPackageInput,
} from "../schema";

const PROVINCES = CAMBODIA_PROVINCE_CODES;
const TRAVEL_TYPES = TravelTypeSchema.options;

type Props = {
  destinations: DestinationResponse[];
  agencyName: string;
  presetDestination?: DestinationResponse;
  onCreated: (pkg: TourPackageResponse) => void;
  onCancel: () => void;
};

export function PackageForm({ presetDestination, onCreated, onCancel }: Props) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPackageFormValues, unknown, NewPackageInput>({
    resolver: zodResolver(NewPackageSchema),
    defaultValues: {
      title: "",
      province: (presetDestination?.province as NewPackageFormValues["province"]) ?? "SIEM_REAP",
      travelType:
        (presetDestination?.travelType as NewPackageFormValues["travelType"]) ?? "HISTORICAL",
      days: 1,
      priceFrom: presetDestination?.priceFrom ?? 0,
      currency: presetDestination?.currency ?? "USD",
      description: "",
      coverImageUrl: "",
    },
  });

  const onSubmit = async (values: NewPackageInput) => {
    const pkg = await createPackageAction({
      title: values.title,
      description: values.description || undefined,
      province: values.province as Province | undefined,
      travelType: values.travelType as TravelType | undefined,
      price: values.priceFrom,
      currency: values.currency,
      durationDays: values.days,
      coverImageUrl: values.coverImageUrl || undefined,
    });
    reset();
    onCreated(pkg);
  };

  return (
    <Card className="bg-surface border-border rounded-2xl border p-5">
      <Form
        className="flex flex-col gap-4"
        validationBehavior="aria"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-title">{t("tours.packages.form.name")}</Label>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                id="p-title"
                placeholder={t("tours.packages.form.namePlaceholder")}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-province">{t("tours.destinations.form.province")}</Label>
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <Select
                  id="p-province"
                  aria-label={t("tours.destinations.form.province")}
                  selectedKey={field.value ?? null}
                  onSelectionChange={(key) => key !== null && field.onChange(String(key))}
                  onBlur={field.onBlur}
                >
                  <Select.Trigger>
                    <Select.Value>
                      {() =>
                        field.value
                          ? t(`destinations.provinces.${field.value}`)
                          : t("tours.packages.form.selectProvince")
                      }
                    </Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {PROVINCES.map((p) => (
                        <ListBox.Item key={p} id={p} textValue={t(`destinations.provinces.${p}`)}>
                          {t(`destinations.provinces.${p}`)}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-travel">{t("tours.destinations.form.travelType")}</Label>
            <Controller
              control={control}
              name="travelType"
              render={({ field }) => (
                <Select
                  id="p-travel"
                  aria-label={t("tours.destinations.form.travelType")}
                  selectedKey={field.value ?? null}
                  onSelectionChange={(key) => key !== null && field.onChange(String(key))}
                  onBlur={field.onBlur}
                >
                  <Select.Trigger>
                    <Select.Value>
                      {() =>
                        field.value
                          ? t(`destinations.travelTypes.${field.value}`)
                          : t("tours.packages.form.selectTravelType")
                      }
                    </Select.Value>
                    <Select.Indicator />
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-days">{t("tours.packages.form.days")}</Label>
            <Controller
              control={control}
              name="days"
              render={({ field }) => (
                <Input
                  id="p-days"
                  type="number"
                  min={1}
                  aria-invalid={Boolean(errors.days)}
                  value={String(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
            {errors.days ? (
              <p className="text-danger text-sm" role="alert">
                {errors.days.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-price">{t("tours.packages.form.price")}</Label>
            <Controller
              control={control}
              name="priceFrom"
              render={({ field }) => (
                <Input
                  id="p-price"
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
          <Button type="button" variant="tertiary" onPress={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" isPending={isSubmitting}>
            {t("tours.packages.form.submit")}
          </Button>
        </div>
      </Form>
    </Card>
  );
}
