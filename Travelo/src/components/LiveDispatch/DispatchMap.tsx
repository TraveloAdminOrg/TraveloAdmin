import { Fragment, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { ActiveDriver } from "../../api/dispatch.api";
import type { Ride } from "../../types/ride";
import type { RegionCode } from "../../lib/regions";

// Default city center + zoom per region so picking a tab moves the map there
// even when the region has no live drivers/rides yet to fit to.
const REGION_VIEW: Record<RegionCode, { center: [number, number]; zoom: number }> = {
  PK: { center: [24.8607, 67.0011], zoom: 11 }, // Karachi
  MT: { center: [35.8989, 14.5146], zoom: 11 }, // Valletta
  GB: { center: [51.5074, -0.1278], zoom: 11 }, // London
};

const WORLD_VIEW: { center: [number, number]; zoom: number } = {
  center: [25, 30],
  zoom: 3,
};

// Fix Leaflet's default-marker icon URLs when bundled by Vite — the default
// behavior breaks because Webpack/Vite rewrites the relative URLs in the CSS.
// Using inline SVG icons sidesteps that entirely and gives us nicer pins.
const buildIcon = (color: string, label: string) =>
  L.divIcon({
    className: "dispatch-map-pin",
    html: `
      <div style="
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        transform: rotate(-45deg);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: 700;
          font-family: ui-sans-serif, system-ui, sans-serif;
        ">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28],
  });

const DRIVER_IDLE_ICON = buildIcon("#10b981", "D");
const DRIVER_BUSY_ICON = buildIcon("#f59e0b", "D");
const RIDE_PICKUP_ICON = buildIcon("#3b82f6", "P");
const RIDE_DROPOFF_ICON = buildIcon("#ef4444", "D");

// Read [lng, lat] from a GeoJSON Point and return [lat, lng] for Leaflet.
const toLatLng = (
  coords?: number[] | null,
): [number, number] | null => {
  if (!coords || coords.length < 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

interface Props {
  drivers: ActiveDriver[];
  rides: Ride[];
  // When a specific region is selected the map snaps to that region's default
  // city view (overridden by auto-fit when there are points to plot).
  region?: RegionCode | "all";
  className?: string;
}

export default function DispatchMap({
  drivers,
  rides,
  region = "all",
  className,
}: Props) {
  // Pre-compute every plottable point + a "ride leg" polyline so the auto-fit
  // logic and the marker layer share the same source of truth.
  const driverPoints = useMemo(
    () =>
      drivers
        .map((d) => {
          const pos = toLatLng(
            d.currentLat !== undefined && d.currentLng !== undefined
              ? [d.currentLng, d.currentLat]
              : null,
          );
          return pos ? { driver: d, pos } : null;
        })
        .filter((x): x is { driver: ActiveDriver; pos: [number, number] } => !!x),
    [drivers],
  );

  const ridePoints = useMemo(
    () =>
      rides.map((r) => {
        const origin = toLatLng(r.origin?.coordinates);
        const destination = toLatLng(r.destination?.coordinates);
        return { ride: r, origin, destination };
      }),
    [rides],
  );

  const allPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];
    driverPoints.forEach((d) => pts.push(d.pos));
    ridePoints.forEach((r) => {
      if (r.origin) pts.push(r.origin);
      if (r.destination) pts.push(r.destination);
    });
    return pts;
  }, [driverPoints, ridePoints]);

  // Initial view: region default if a region is selected, else first point or
  // a wide world view. The `FitBounds` child handles ongoing updates.
  const initial =
    region !== "all" && REGION_VIEW[region]
      ? REGION_VIEW[region]
      : allPoints[0]
        ? { center: allPoints[0], zoom: 12 }
        : WORLD_VIEW;

  return (
    <div
      className={`h-[320px] w-full overflow-hidden rounded-2xl sm:h-[380px] lg:h-[420px] ${className ?? ""}`}
    >
      <MapContainer
        center={initial.center}
        zoom={initial.zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        {/* CartoDB Voyager — English labels, no API key required, free for
            non-commercial use. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />

        <FitBounds points={allPoints} region={region} />

        {driverPoints.map(({ driver, pos }) => (
          <Marker
            key={`driver-${driver._id}`}
            position={pos}
            icon={driver.currentRideId ? DRIVER_BUSY_ICON : DRIVER_IDLE_ICON}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-semibold">
                  {driver.fullName || driver.username || "Driver"}
                </div>
                <div className="text-gray-500">
                  {driver.currentRideId ? "On a ride" : "Idle"}
                </div>
                {driver.phone && (
                  <div className="text-gray-500">{driver.phone}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {ridePoints.map(({ ride, origin, destination }) => {
          const userName =
            typeof ride.userId === "object" && ride.userId
              ? ride.userId.fullName || ride.userId.username
              : undefined;
          return (
            <Fragment key={`ride-${ride._id}`}>
              {origin && (
                <Marker position={origin} icon={RIDE_PICKUP_ICON}>
                  <Popup>
                    <div className="text-xs">
                      <div className="font-semibold">Pickup</div>
                      <div>{userName ?? "—"}</div>
                      <div className="font-mono text-[10px] text-gray-500">
                        {ride._id.slice(-8)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              {destination && (
                <Marker position={destination} icon={RIDE_DROPOFF_ICON}>
                  <Popup>
                    <div className="text-xs">
                      <div className="font-semibold">Drop-off</div>
                      <div>{userName ?? "—"}</div>
                      <div className="font-mono text-[10px] text-gray-500">
                        {ride._id.slice(-8)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              {origin && destination && (
                <Polyline
                  positions={[origin, destination]}
                  pathOptions={{
                    color: "#3b82f6",
                    weight: 3,
                    opacity: 0.6,
                    dashArray: "6 6",
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Re-frame the map every time the plotted points OR the selected region
// changes so the user always sees the relevant area.
function FitBounds({
  points,
  region,
}: {
  points: [number, number][];
  region: RegionCode | "all";
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      // No live points — snap to the region's default city view (or world
      // view when "all" regions are selected).
      const view =
        region !== "all" && REGION_VIEW[region] ? REGION_VIEW[region] : WORLD_VIEW;
      map.setView(view.center, view.zoom);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [points, region, map]);
  return null;
}
