"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MapView from "@/components/MapView";
import PointDrawer from "@/components/PointDrawer";
import NearbySection from "@/components/NearbySection";
import LayersControl from "@/components/LayersControl";
import type { Parque, Punto, Mensaje, NearbyResponse, Foto } from "@/lib/types";

type ParkMapClientProps = {
  parque: Parque;
  initialPuntoId: string | null;
};

export default function ParkMapClient({
  parque,
  initialPuntoId,
}: ParkMapClientProps) {
  const [selectedPunto, setSelectedPunto] = useState<Punto | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showLayers, setShowLayers] = useState({
    puntos: true,
    sanitarios: true,
    emergencia: true,
    salidas: true,
    caminos: true,
  });
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyData, setNearbyData] = useState<NearbyResponse | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (initialPuntoId && parque.puntos?.length) {
      const p = parque.puntos.find((x) => x.id === initialPuntoId);
      if (p) setSelectedPunto(p);
    }
  }, [initialPuntoId, parque.puntos]);

  const toggleLayer = useCallback((key: keyof typeof showLayers) => {
    setShowLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!cancelled) {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPunto) {
      setMensajes([]);
      return;
    }
    setLoadingMensajes(true);
    fetch(`/api/puntos/${selectedPunto.id}/mensajes`)
      .then((r) => r.json())
      .then((data) => setMensajes(Array.isArray(data) ? data : []))
      .catch(() => setMensajes([]))
      .finally(() => setLoadingMensajes(false));
  }, [selectedPunto?.id]);

  useEffect(() => {
    if (!selectedPunto) {
      setFotos([]);
      return;
    }
    setLoadingFotos(true);
    fetch(`/api/parques/${parque.id}/fotos?puntoId=${selectedPunto.id}`)
      .then((r) => r.json())
      .then((data) => setFotos(Array.isArray(data) ? data : []))
      .catch(() => setFotos([]))
      .finally(() => setLoadingFotos(false));
  }, [parque.id, selectedPunto?.id]);

  const fetchNearby = useCallback(() => {
    if (!userLocation) {
      setNearbyLoading(true);
      setNearbyData({ puntos: [], especiesCercanas: [] });
      setShowNearby(true);
      setNearbyLoading(false);
      return;
    }
    setNearbyLoading(true);
    setShowNearby(true);
    fetch(
      `/api/parques/${parque.id}/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=2`
    )
      .then((r) => r.json())
      .then((data: NearbyResponse) => setNearbyData(data))
      .catch(() => setNearbyData({ puntos: [], especiesCercanas: [] }))
      .finally(() => setNearbyLoading(false));
  }, [parque.id, userLocation]);

  const handleSendMessage = useCallback(
    (texto: string, autor?: string) => {
      if (!selectedPunto) return;
      setSendingMessage(true);
      fetch(`/api/puntos/${selectedPunto.id}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, autor }),
      })
        .then((r) => r.json())
        .then((m) => {
          if (m.id) setMensajes((prev) => [m, ...prev]);
        })
        .finally(() => setSendingMessage(false));
    },
    [selectedPunto]
  );

  const handleUploadPhoto = useCallback(
    (file: File, autor?: string) => {
      if (!selectedPunto) return;
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.set("file", file);
      fetch("/api/upload", { method: "POST", body: formData })
        .then((r) => r.json())
        .then((data: { url?: string }) => {
          if (data.url) {
            return fetch("/api/fotos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                parqueId: parque.id,
                puntoId: selectedPunto.id,
                url: data.url,
                autor: autor || undefined,
              }),
            });
          }
          throw new Error("No URL");
        })
        .then((r) => r.json())
        .then((foto) => {
          if (foto.id) setFotos((prev) => [foto, ...prev]);
        })
        .finally(() => setUploadingPhoto(false));
    },
    [parque.id, selectedPunto]
  );

  const handleShare = useCallback((punto: Punto) => {
    const url = `${window.location.origin}/p/${parque.id}?punto=${punto.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${punto.nombre} - ${parque.nombre}`,
        text: punto.descripcion || punto.nombre,
        url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  }, [parque.id, parque.nombre]);

  return (
    <main className="h-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex flex-col bg-slate-900">
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <Link
          href="/"
          className="text-slate-400 hover:text-white text-sm"
          aria-label="Volver al inicio"
        >
          ← Inicio
        </Link>
        <h1 className="text-base font-semibold text-white truncate max-w-[50%]">
          {parque.nombre}
        </h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 relative min-h-0 p-2">
        <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-800">
          <MapView
            parque={parque}
            initialPuntoId={initialPuntoId}
            onPointSelect={setSelectedPunto}
            userLocation={userLocation}
            showLayers={showLayers}
          />
          <LayersControl showLayers={showLayers} onToggle={toggleLayer} />
        </div>
      </div>

      <div
        className={navExpanded ? "nav-bottom-spacer" : "nav-bottom-spacer nav-bottom-spacer--collapsed"}
        aria-hidden="true"
      />

      <nav
        className={`nav-bottom-bar ${navExpanded ? "is-expanded" : ""}`}
        aria-label="Navegación principal"
      >
        <button
          type="button"
          onClick={() => setNavExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 text-white hover:bg-slate-700/50 transition-colors rounded-t-xl min-h-[32px]"
          aria-expanded={navExpanded}
          aria-label={navExpanded ? "Cerrar menú" : "Abrir menú"}
        >
          <span className="text-xs font-medium">{navExpanded ? "Cerrar menú" : "Menú"}</span>
          <span className="text-base" aria-hidden="true">{navExpanded ? "▼" : "▲"}</span>
        </button>
        <div className="nav-bottom-menu flex items-center justify-around px-4 pb-2">
          <button
            type="button"
            onClick={() => { setShowNearby(false); setNavExpanded(false); }}
            className="flex flex-col items-center gap-1 py-1 text-white min-w-[4rem]"
            aria-label="Mapa"
          >
            <span className="text-xl" aria-hidden="true">🗺️</span>
            <span className="text-xs">Mapa</span>
          </button>
          <button
            type="button"
            onClick={() => { fetchNearby(); setNavExpanded(false); }}
            className="flex flex-col items-center gap-1 py-1 text-white min-w-[4rem]"
            aria-label="Qué estás viendo"
          >
            <span className="text-xl" aria-hidden="true">👁️</span>
            <span className="text-xs">Desde aquí</span>
          </button>
          <button
            type="button"
            onClick={() => { setSelectedPunto(null); setNavExpanded(false); }}
            className="flex flex-col items-center gap-1 py-1 text-slate-400 min-w-[4rem]"
            aria-label="Punto actual"
          >
            <span className="text-xl" aria-hidden="true">📍</span>
            <span className="text-xs">Punto</span>
          </button>
        </div>
      </nav>

      {showNearby && (
        <NearbySection
          puntos={nearbyData?.puntos ?? []}
          especies={nearbyData?.especiesCercanas ?? []}
          loading={nearbyLoading}
          onSelectPoint={(p) => {
            setSelectedPunto(p);
            setShowNearby(false);
          }}
          onClose={() => setShowNearby(false)}
        />
      )}

      {selectedPunto && !showNearby && (
        <PointDrawer
          punto={selectedPunto}
          parqueNombre={parque.nombre}
          parqueId={parque.id}
          onClose={() => setSelectedPunto(null)}
          onShare={handleShare}
          onLeaveMessage={() => {}}
          mensajes={mensajes}
          loadingMensajes={loadingMensajes}
          onSendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
          fotos={fotos}
          loadingFotos={loadingFotos}
          onUploadPhoto={handleUploadPhoto}
          uploadingPhoto={uploadingPhoto}
        />
      )}
    </main>
  );
}
