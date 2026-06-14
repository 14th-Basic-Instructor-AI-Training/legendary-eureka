"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Location } from "iconsax-reactjs";
import { Button } from "@/ui";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Interactive 3D map for a single destination, built on **MapLibre GL JS** with
 * free, no-API-key tiles:
 *   - base vector style from OpenFreeMap (streets + 3D building extrusions)
 *   - terrain DEM from the public AWS terrain tiles (terrarium encoding)
 * The camera is pitched so the buildings + terrain read as 3D, with a marker on
 * the destination. Renders loading / error states explicitly and honors
 * `prefers-reduced-motion` (flat, un-pitched view) per styling conventions.
 */

/** Free, no-key vector basemap (includes building layers for 3D extrusion). */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
/** Free, no-key elevation tiles (terrarium-encoded) for the 3D terrain. */
const TERRAIN_TILES = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png";
/** Brand primary (`--primary-lightskyblue`) — the marker pin color. */
const MARKER_COLOR = "#4FB5DB";

export function LocationMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  // Bumped on retry to re-run the init effect after a failure.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibreMap | undefined;
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !containerRef.current) return;

        const reduceMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        map = new maplibregl.Map({
          container: containerRef.current,
          style: STYLE_URL,
          center: [lng, lat],
          zoom: 14.5,
          pitch: reduceMotion ? 0 : 62,
          bearing: reduceMotion ? 0 : -20,
          attributionControl: { compact: true },
        });

        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
        map.addControl(new maplibregl.FullscreenControl(), "top-right");

        new maplibregl.Marker({ color: MARKER_COLOR })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 28, closeButton: false }).setText(label))
          .addTo(map);

        map.on("load", () => {
          if (cancelled || !map) return;
          // Add free terrain DEM and lift the surface for a real 3D relief.
          if (!map.getSource("terrain-dem")) {
            map.addSource("terrain-dem", {
              type: "raster-dem",
              tiles: [TERRAIN_TILES],
              encoding: "terrarium",
              tileSize: 256,
              maxzoom: 15,
            });
          }
          map.setTerrain({ source: "terrain-dem", exaggeration: 1.25 });
          map.addControl(
            new maplibregl.TerrainControl({ source: "terrain-dem", exaggeration: 1.25 }),
            "top-right",
          );
          setStatus("ready");
        });

        // A failed style/tile fetch is the most likely failure — surface it.
        map.on("error", (e) => {
          const isStyleFailure = String(e?.error?.message ?? "").length > 0 && !map?.isStyleLoaded();
          if (!cancelled && isStyleFailure) setStatus("error");
        });
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, label, attempt]);

  return (
    <div className="border-border relative mt-4 h-96 overflow-hidden rounded-3xl border">
      <div ref={containerRef} className="h-full w-full" aria-label={t("destinations.detail.mapLabel", { name: label })} />

      {status === "loading" ? (
        <div className="bg-surface text-muted absolute inset-0 flex items-center justify-center text-sm">
          <span className="flex items-center gap-2">
            <Location size={18} color="currentColor" variant="Bold" className="text-primary animate-pulse" />
            {t("destinations.detail.mapLoading")}
          </span>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="bg-surface text-muted absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm">
          <span className="flex items-center gap-2">
            <Location size={18} color="currentColor" variant="Bold" className="text-primary" />
            {t("destinations.detail.mapError")}
          </span>
          <Button variant="secondary" size="sm" onPress={() => setAttempt((n) => n + 1)}>
            {t("common.retry")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
