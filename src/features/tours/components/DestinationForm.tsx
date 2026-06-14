"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
} from "@/ui";
import { useSession } from "@/lib/auth";
import { ProvinceSchema, TravelTypeSchema } from "@/features/destinations/schema";
import {
  NewDestinationSchema,
  type DestinationOrigin,
  type NewDestinationFormValues,
  type NewDestinationInput,
} from "../schema";
import { useToursStore } from "../store";

const PROVINCES = ProvinceSchema.options;
const TRAVEL_TYPES = TravelTypeSchema.options;

type Props = {
  /** Marks the created destination as admin- or agency-owned (Flow 1 vs Flow 2). */
  origin: DestinationOrigin;
  /** Display name stored as the destination owner. */
  ownerName: string;
  onDone: () => void;
};

/** Create-destination form. Shared by the agency tours panel and admin manager. */
export function DestinationForm({ origin, ownerName, onDone }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const addDestination = useToursStore((s) => s.addDestination);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewDestinationFormValues, unknown, NewDestinationInput>({
    resolver: zodResolver(NewDestinationSchema),
    defaultValues: {
      name: "",
      province: "SIEM_REAP",
      travelType: "HISTORICAL",
      summary: "",
      priceFrom: 0,
    },
  });

  const onSubmit = (values: NewDestinationInput) => {
    addDestination(role, values, origin, ownerName);
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="d-province">{t("tours.destinations.form.province")}</Label>
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <Select
                  id="d-province"
                  aria-label={t("tours.destinations.form.province")}
                  selectedKey={field.value}
                  onSelectionChange={(key) => key !== null && field.onChange(key)}
                  onBlur={field.onBlur}
                >
                  <Select.Trigger>
                    <Select.Value>
                      {() => t(`destinations.provinces.${field.value}`)}
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
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {TRAVEL_TYPES.map((tt) => (
                        <ListBox.Item key={tt} id={tt} textValue={t(`destinations.travelTypes.${tt}`)}>
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
          <Label htmlFor="d-summary">{t("tours.destinations.form.summary")}</Label>
          <Controller
            control={control}
            name="summary"
            render={({ field }) => (
              <TextArea
                id="d-summary"
                placeholder={t("tours.destinations.form.summaryPlaceholder")}
                aria-invalid={Boolean(errors.summary)}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.summary ? (
            <p className="text-danger text-sm" role="alert">
              {errors.summary.message}
            </p>
          ) : null}
        </div>

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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="tertiary" onPress={onDone}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" isPending={isSubmitting}>
            {t("tours.destinations.form.submit")}
          </Button>
        </div>
      </Form>
    </Card>
  );
}
