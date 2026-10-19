
"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";

type Point = {
  lat: number;
  lng: number;
};

type Props = {
  pickup: Point | null;
  drop: Point | null;
  routeCoordinates: [number, number][];
};

const defaultCenter: [number, number] = [28.6139, 77.209];

const pickupIcon = L.divIcon({
  className: "gocab-map-marker",
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#16a34a;border:3px solid white;box-shadow:0 3px 12px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800;">P</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const dropIcon = L.divIcon({
  className: "gocab-map-marker",
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#e11d48;border:3px solid white;box-shadow:0 3px 12px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800;">D</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapUpdater({
  pickup,
  drop,
  routeCoordinates,
}: Props) {
  const map = useMap();

  useEffect(() => {
    // Wait until the map container has its final dimensions.
    const timer = window.setTimeout(() => {
      map.invalidateSize({ animate: false });

      if (routeCoordinates.length > 1) {
        const bounds = L.latLngBounds(routeCoordinates);

        map.fitBounds(bounds, {
          paddingTopLeft: [45, 45],
          paddingBottomRight: [45, 45],
          maxZoom: 15,
          animate: false,
        });

        return;
      }

      if (pickup && drop) {
        map.fitBounds(
          [
            [pickup.lat, pickup.lng],
            [drop.lat, drop.lng],
          ],
          {
            padding: [45, 45],
            maxZoom: 14,
            animate: false,
          }
        );

        return;
      }

      if (pickup) {
        map.setView([pickup.lat, pickup.lng], 14);
      } else if (drop) {
        map.setView([drop.lat, drop.lng], 14);
      } else {
        map.setView(defaultCenter, 11);
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [map, pickup, drop, routeCoordinates]);

  return null;
}

export default function GoCabMap({
  pickup,
  drop,
  routeCoordinates,
}: Props) {
  const initialCenter = useMemo<[number, number]>(() => {
    if (pickup) return [pickup.lat, pickup.lng];
    if (drop) return [drop.lat, drop.lng];
    return defaultCenter;
  }, [pickup, drop]);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-slate-100">
      <MapContainer
        center={initialCenter}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={true}
        preferCanvas={true}
        className="gocab-leaflet-map"
        style={{
          height: "100%",
          width: "100%",
          background: "#eef2f7",
        }}
      >
        {/* Free, light OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
          keepBuffer={4}
          updateWhenIdle={true}
        />

        <ZoomControl position="bottomright" />

        {/* White outline makes the route easy to see */}
        {routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#ffffff",
                weight: 9,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />

            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#4f46e5",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {pickup && (
          <Marker
            position={[pickup.lat, pickup.lng]}
            icon={pickupIcon}
          >
            <Tooltip direction="top" offset={[0, -18]}>
              Pickup location
            </Tooltip>
          </Marker>
        )}

        {drop && (
          <Marker
            position={[drop.lat, drop.lng]}
            icon={dropIcon}
          >
            <Tooltip direction="top" offset={[0, -18]}>
              Destination
            </Tooltip>
          </Marker>
        )}

        <MapUpdater
          pickup={pickup}
          drop={drop}
          routeCoordinates={routeCoordinates}
        />
      </MapContainer>

      {/* Map status */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] sm:left-4 sm:top-4">
        <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                routeCoordinates.length > 1
                  ? "bg-emerald-500"
                  : "bg-indigo-500"
              }`}
            />
            <span className="text-xs font-semibold text-slate-800">
              {routeCoordinates.length > 1
                ? "Route ready"
                : "Explore the map"}
            </span>
          </div>
        </div>
      </div>

      {/* Pickup and destination legend */}
      {(pickup || drop) && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-md backdrop-blur-sm sm:bottom-4 sm:left-4">
          {pickup && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-extrabold text-white">
                P
              </span>
              Pickup
            </div>
          )}

          {drop && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white">
                D
              </span>
              Destination
            </div>
          )}
        </div>
      )}
    </div>
  );
}
