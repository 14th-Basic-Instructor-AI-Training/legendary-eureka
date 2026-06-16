"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Location } from "iconsax-reactjs";
import { Button } from "@/ui";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

/**
 * Interactive 3D map for a single place, built on **MapLibre GL JS** with free,
 * no-API-key tiles:
 *   - base vector style from OpenFreeMap (streets + 3D building extrusions)
 *   - terrain DEM from the public AWS terrain tiles (terrarium encoding)
 * The camera is pitched so the buildings + terrain read as 3D, with a marker on
 * the place. Renders loading / error states explicitly and honors
 * `prefers-reduced-motion` (flat, un-pitched view) per styling conventions.
 *
 * Two modes, controlled by `interactive`:
 *   - **view** (default): a fixed marker — used on public destination/agency pages.
 *   - **pick**: a draggable marker; clicking the map or dragging the pin reports the
 *     new coordinates via `onPositionChange` (used by the agency profile editor).
 * The map is created once; the marker moves imperatively so a parent coordinate
 * update never re-initializes (and thus never flickers) the map.
 */

/** Free, no-key vector basemap (includes building layers for 3D extrusion). */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
/** Free, no-key elevation tiles (terrarium-encoded) for the 3D terrain. */
const TERRAIN_TILES = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png";
/** Brand primary (`--primary-lightskyblue`) — the marker pin color. */
const MARKER_COLOR = "#4FB5DB";
/** Center used in pick mode before a pin has been placed (Phnom Penh). */
const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };

export function LocationMap({
  lat,
  lng,
  label,
  interactive = false,
  onPositionChange,
  fallbackCenter = DEFAULT_CENTER,
}: {
  lat: number;
  lng: number;
  label: string;
  interactive?: boolean;
  onPositionChange?: (lat: number, lng: number) => void;
  fallbackCenter?: { lat: number; lng: number };
}) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  // Keep the latest callback without making it an effect dependency (avoids re-init).
  const onPositionChangeRef = useRef(onPositionChange);
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  // Bumped on retry to re-run the init effect after a failure.
  const [attempt, setAttempt] = useState(0);

  const hasFix = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  const startLat = hasFix ? lat : fallbackCenter.lat;
  const startLng = hasFix ? lng : fallbackCenter.lng;

  // Init the map once per mount/retry/mode — NOT on coordinate changes.
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
          center: [startLng, startLat],
          zoom: 14.5,
          pitch: reduceMotion ? 0 : 62,
          bearing: reduceMotion ? 0 : -20,
          attributionControl: { compact: true },
        });

        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
        map.addControl(new maplibregl.FullscreenControl(), "top-right");

        const marker = new maplibregl.Marker({ color: MARKER_COLOR, draggable: interactive })
          .setLngLat([startLng, startLat]);
        if (!interactive) {
          marker.setPopup(new maplibregl.Popup({ offset: 28, closeButton: false }).setText(label));
        }
        marker.addTo(map);
        markerRef.current = marker;

        if (interactive) {
          marker.on("dragend", () => {
            const { lat: mLat, lng: mLng } = marker.getLngLat();
            onPositionChangeRef.current?.(mLat, mLng);
          });
          map.on("click", (e) => {
            marker.setLngLat(e.lngLat);
            onPositionChangeRef.current?.(e.lngLat.lat, e.lngLat.lng);
          });
          map.getCanvas().style.cursor = "crosshair";
        }

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
      markerRef.current = null;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, attempt]);

  // Move the marker imperatively when the parent supplies new coordinates
  // (e.g. typed into the lat/lng inputs) — without re-creating the map.
  useEffect(() => {
    if (markerRef.current && hasFix) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [lat, lng, hasFix]);

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
