"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown2, CloseCircle, SearchNormal1 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * A lightweight searchable single-select (the Tour tab's "Province / Destination"
 * dropdown). Type to filter the options; pick one to set the value; the clear
 * button resets it. Closes on outside click.
 */
export function SearchableSelect({
  options,
  value,
  placeholder,
  onChange,
}: {
  options: readonly string[];
  value: string | undefined;
  placeholder: string;
  onChange: (value: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="border-border bg-background focus-within:border-primary-lightskyblue flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
        <SearchNormal1 size={16} color="currentColor" className="text-muted shrink-0" />
        <input
          className="placeholder:text-muted w-full bg-transparent outline-none"
          placeholder={value ?? placeholder}
          value={open ? query : (value ?? "")}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        {value ? (
          <button
            type="button"
            aria-label={t("explore.filters.clearOne")}
            onClick={() => {
              onChange(undefined);
              setQuery("");
            }}
          >
            <CloseCircle size={16} color="currentColor" className="text-muted hover:text-foreground" />
          </button>
        ) : (
          <ArrowDown2 size={16} color="currentColor" className="text-muted shrink-0" />
        )}
      </div>

      {open ? (
        <ul className="border-border bg-background absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border py-1 shadow-md">
          {filtered.length === 0 ? (
            <li className="text-muted px-3 py-2 text-sm">{t("explore.filters.noMatches")}</li>
          ) : (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => select(option)}
                  className={cn(
                    "hover:bg-surface w-full px-3 py-2 text-left text-sm",
                    option === value ? "text-primary font-medium" : "text-foreground",
                  )}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
