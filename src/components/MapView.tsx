"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Parque, Punto, UtilityLayerItem } from "@/lib/types";

const LEAFLET_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPuntoPopupContent(p: Punto, baseUrl: string): string {
  const nombre = escapeHtml(p.nombre);
  const tipo = escapeHtml(p.tipo);
  const descShort = p.descripcion
    ? escapeHtml(p.descripcion.slice(0, 100) + (p.descripcion.length > 100 ? "…" : ""))
    : "";
  const primeraEspecie = p.especies?.[0];
  const imgHtml =
    primeraEspecie?.imagenUrl
      ? `<img src="${baseUrl}${primeraEspecie.imagenUrl.startsWith("/") ? "" : "/"}${primeraEspecie.imagenUrl}" alt="" class="map-popup-img" />`
      : primeraEspecie
        ? `<div class="map-popup-emoji">${primeraEspecie.tipo === "árbol" ? "🌳" : primeraEspecie.tipo === "animal" ? "🦌" : "🌿"}</div>`
        : "";
  const especieNombre = primeraEspecie ? escapeHtml(primeraEspecie.nombre) : "";
  const masEspecies = (p.especies?.length ?? 0) > 1 ? ` y ${(p.especies?.length ?? 0) - 1} más` : "";
  return `
    <div class="map-popup map-popup-punto">
      <div class="map-popup-header">
        <strong class="map-popup-title">${nombre}</strong>
        <span class="map-popup-tipo">${tipo}</span>
      </div>
      ${descShort ? `<p class="map-popup-desc">${descShort}</p>` : ""}
      ${imgHtml || especieNombre ? `
        <div class="map-popup-especie">
          ${imgHtml}
          ${especieNombre ? `<span class="map-popup-especie-nombre">${especieNombre}${masEspecies}</span>` : ""}
        </div>
      ` : ""}
      <p class="map-popup-hint">Clic para ver la ficha completa</p>
    </div>
  `.trim();
}

function buildUtilPopupContent(u: UtilityLayerItem): string {
  const labels: Record<string, string> = {
    sanitario: "Sanitario",
    emergencia: "Emergencia",
    salida: "Salida",
    camino: "Camino",
  };
  const tipoLabel = labels[u.tipo] || u.tipo;
  const nombre = u.nombre ? escapeHtml(u.nombre) : "";
  return `
    <div class="map-popup map-popup-util">
      <strong class="map-popup-title">${tipoLabel}</strong>
      ${nombre ? `<p class="map-popup-desc">${nombre}</p>` : ""}
    </div>
  `.trim();
}

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
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
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
              .bindPopup(buildPuntoPopupContent(p, baseUrl), {
                maxWidth: 280,
                minWidth: 200,
                className: "map-popup-punto-wrap",
              })
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
            const m = L.marker([u.lat, u.lng], { icon })
              .addTo(map)
              .bindPopup(buildUtilPopupContent(u), {
                maxWidth: 260,
                className: "map-popup-util-wrap",
              });
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
