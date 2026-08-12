"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PIN_ICON = L.divIcon({
  className: "",
  html: `<svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#006c49"/><circle cx="12" cy="9" r="2.8" fill="#fff"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 17));
  }, [target, map]);
  return null;
}

function MapClick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function LokasiMap({
  lat,
  lng,
  radiusMeters,
  flyTarget,
  onPick,
}: {
  lat: number;
  lng: number;
  radiusMeters: number;
  flyTarget: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  return (
    <div className="isolate rounded-xl overflow-hidden border border-[#c6c6cd] shadow-sm">
      <MapContainer
        center={valid ? [lat, lng] : [-7.982, 110.604]}
        zoom={valid ? 17 : 12}
        className="h-72 md:h-96 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid && (
          <>
            <Marker position={[lat, lng]} icon={PIN_ICON} />
            <Circle
              center={[lat, lng]}
              radius={radiusMeters}
              pathOptions={{
                color: "#006c49",
                fillColor: "#006c49",
                fillOpacity: 0.15,
              }}
            />
          </>
        )}
        <MapClick onPick={onPick} />
        <FlyTo target={flyTarget} />
      </MapContainer>
    </div>
  );
}