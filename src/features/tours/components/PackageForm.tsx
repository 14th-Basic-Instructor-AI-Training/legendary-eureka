"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Card, Form, Input, Label, ListBox, Select } from "@/ui";
import { useSession } from "@/lib/auth";
import {
  NewPackageSchema,
  type NewPackageFormValues,
  type NewPackageInput,
  type TourDestination,
} from "../schema";
import { useToursStore } from "../store";

type Props = {
  /** Destinations the agency can build a package on (admin + own). */
  destinations: TourDestination[];
  agencyName: string;
  /** Pre-select a destination (e.g. "Build package" from a destination card). */
  presetDestinationId?: string;
  onDone: () => void;
};

/** Create-package form with a destination picker (RHF + Zod). */
export function PackageForm({ destinations, agencyName, presetDestinationId, onDone }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const addPackage = useToursStore((s) => s.addPackage);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPackageFormValues, unknown, NewPackageInput>({
    resolver: zodResolver(NewPackageSchema),
    defaultValues: {
      title: "",
      destinationId: presetDestinationId ?? "",
      days: 1,
      priceFrom: 0,
    },
  });

  const onSubmit = (values: NewPackageInput) => {
    addPackage(role, values, agencyName);
    reset();
    onDone();
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-destination">{t("tours.packages.form.destination")}</Label>
          <Controller
            control={control}
            name="destinationId"
            render={({ field }) => (
              <Select
                id="p-destination"
                aria-label={t("tours.packages.form.destination")}
                selectedKey={field.value || null}
                onSelectionChange={(key) => key !== null && field.onChange(String(key))}
                onBlur={field.onBlur}
              >
                <Select.Trigger>
                  <Select.Value>
                    {() => {
                      const d = destinations.find((x) => x.id === field.value);
                      return d ? d.name : t("tours.packages.form.selectDestination");
                    }}
                  </Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {destinations.map((d) => (
                      <ListBox.Item key={d.id} id={d.id} textValue={d.name}>
                        {d.name} · {t(`tours.destinations.origin.${d.origin}`)}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
          {errors.destinationId ? (
            <p className="text-danger text-sm" role="alert">
              {errors.destinationId.message}
            </p>
          ) : null}
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
          <Button type="button" variant="tertiary" onPress={onDone}>
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
