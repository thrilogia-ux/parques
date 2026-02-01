"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Parque, Punto, UtilityLayerItem } from "@/lib/types";

const LEAFLET_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

type MapViewProps = {
  parque: Parque;
  initialPuntoId?: string | null;
  onPointSelect: (punto: Punto) => void;
  userLocation: { lat: number; lng: number } | null;
  showLayers: { puntos: boolean; sanitarios: boolean; emergencia: boolean; salidas: boolean; caminos: boolean };
};

export default function MapView({
  parque,
  initialPuntoId,
  onPointSelect,
  userLocation,
  showLayers,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<Window["L"]["map"]> | null>(null);
  const puntoMarkersRef = useRef<ReturnType<Window["L"]["marker"]>[]>([]);
  const utilMarkersRef = useRef<ReturnType<Window["L"]["marker"]>[]>([]);
  const userMarkerRef = useRef<ReturnType<Window["L"]["marker"]> | null>(null);

  const initMap = useCallback(() => {
    if (!containerRef.current || !window.L) return;
    const L = window.L;
    const bounds: [[number, number], [number, number]] = [
      [parque.boundsLat1, parque.boundsLng1],
      [parque.boundsLat2, parque.boundsLng2],
    ];
    const map = L.map(containerRef.current, {
      center: [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2],
      zoom: 14,
      zoomControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.fitBounds(bounds, { padding: [20, 20] });
    const tileUrl = parque.mapTileUrl || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    L.tileLayer(tileUrl, { attribution: "© OpenStreetMap" }).addTo(map);
    mapRef.current = map;
    return map;
  }, [parque.boundsLat1, parque.boundsLng1, parque.boundsLat2, parque.boundsLng2, parque.mapTileUrl]);

  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L && containerRef.current) {
        const map = initMap();
        if (map) {
          (parque.puntos || []).forEach((p) => {
            const L = window.L;
            const icon = L.divIcon({
              className: "custom-marker-punto",
              html: `<span aria-hidden="true">📍</span>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            const m = L.marker([p.lat, p.lng], { icon })
              .addTo(map)
              .on("click", () => onPointSelect(p));
            puntoMarkersRef.current.push(m);
          });
          (parque.utilityLayerItems || []).forEach((u) => {
            const visible =
              (u.tipo === "sanitario" && showLayers.sanitarios) ||
              (u.tipo === "emergencia" && showLayers.emergencia) ||
              (u.tipo === "salida" && showLayers.salidas) ||
              (u.tipo === "camino" && showLayers.caminos);
            if (!visible) return;
            const L = window.L;
            const emoji = u.tipo === "sanitario" ? "🚻" : u.tipo === "emergencia" ? "🆘" : u.tipo === "salida" ? "🚪" : "🛤️";
            const icon = L.divIcon({
              className: "custom-marker-util",
              html: `<span aria-hidden="true">${emoji}</span>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            const m = L.marker([u.lat, u.lng], { icon }).addTo(map);
            utilMarkersRef.current.push(m);
          });
          if (userLocation) {
            const L = window.L;
            const icon = L.divIcon({
              className: "custom-marker-user",
              html: `<span aria-hidden="true">●</span>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(map);
          }
        }
      }
    };
    if (window.L) {
      loadLeaflet();
      return () => {
        puntoMarkersRef.current.forEach((m) => m.remove());
        puntoMarkersRef.current = [];
        utilMarkersRef.current.forEach((m) => m.remove());
        utilMarkersRef.current = [];
        userMarkerRef.current?.remove();
        userMarkerRef.current = null;
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }
    const script = document.createElement("script");
    script.src = LEAFLET_URL;
    script.async = true;
    script.onload = loadLeaflet;
    document.head.appendChild(script);
    return () => {
      script.remove();
      puntoMarkersRef.current.forEach((m) => m.remove());
      puntoMarkersRef.current = [];
      utilMarkersRef.current.forEach((m) => m.remove());
      utilMarkersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [parque.id, initMap, onPointSelect, userLocation, showLayers]);

  useEffect(() => {
    if (!window.L || !mapRef.current || !userLocation) return;
    userMarkerRef.current?.setLatLng([userLocation.lat, userLocation.lng]);
    if (!userMarkerRef.current) {
      const L = window.L;
      const icon = L.divIcon({
        className: "custom-marker-user",
        html: `<span aria-hidden="true">●</span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(mapRef.current);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!initialPuntoId || !parque.puntos || !mapRef.current) return;
    const p = parque.puntos.find((x) => x.id === initialPuntoId);
    if (p) {
      mapRef.current.setView([p.lat, p.lng], 16);
      onPointSelect(p);
    }
  }, [initialPuntoId, parque.puntos, onPointSelect]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] rounded-lg z-0"
      style={{ background: "#1e293b" }}
    />
  );
}
