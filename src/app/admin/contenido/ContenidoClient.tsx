"use client";

import { useState } from "react";

type ParqueRow = { id: string; nombre: string; boundsLat1: number; boundsLng1: number; boundsLat2: number; boundsLng2: number };
type PuntoRow = { id: string; nombre: string; tipo: string; lat: number; lng: number; orden: number; parque: { nombre: string }; parqueId: string };
type EspecieRow = { id: string; nombre: string; tipo: string; parque: { nombre: string }; parqueId: string };
type EspecieFotoRow = { id: string; url: string; orden: number };
type EspecieEdit = EspecieRow & { descripcion: string | null; imagenUrl: string | null; fotos: EspecieFotoRow[] };
type UtilRow = { id: string; tipo: string; lat: number; lng: number; nombre: string | null; parque: { nombre: string }; parqueId: string };

type ContenidoClientProps = {
  initialParques: ParqueRow[];
  initialPuntos: PuntoRow[];
  initialEspecies: EspecieRow[];
  initialUtilidades: UtilRow[];
};

export default function ContenidoClient({
  initialParques,
  initialPuntos,
  initialEspecies,
  initialUtilidades,
}: ContenidoClientProps) {
  const [parques, setParques] = useState(initialParques);
  const [puntos, setPuntos] = useState(initialPuntos);
  const [especies, setEspecies] = useState(initialEspecies);
  const [utilidades, setUtilidades] = useState(initialUtilidades);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [puntoEspecies, setPuntoEspecies] = useState<EspecieRow[]>([]);
  const [puntoEspeciesPuntoId, setPuntoEspeciesPuntoId] = useState<string | null>(null);
  const [editingEspecie, setEditingEspecie] = useState<EspecieEdit | null>(null);
  const [editEspecieForm, setEditEspecieForm] = useState({ nombre: "", tipo: "árbol", descripcion: "", imagenUrl: "" });

  const [formParque, setFormParque] = useState({ nombre: "", descripcion: "", boundsLat1: "", boundsLng1: "", boundsLat2: "", boundsLng2: "", mapTileUrl: "" });
  const [formPunto, setFormPunto] = useState({ parqueId: "", nombre: "", tipo: "mirador", lat: "", lng: "", descripcion: "", orden: "0" });
  const [formEspecie, setFormEspecie] = useState({ parqueId: "", nombre: "", tipo: "árbol", descripcion: "", imagenUrl: "" });
  const [formUtil, setFormUtil] = useState({ parqueId: "", tipo: "sanitario", lat: "", lng: "", nombre: "" });

  const submitParque = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading("parque");
    try {
      const res = await fetch("/api/parques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formParque.nombre.trim(),
          descripcion: formParque.descripcion.trim() || undefined,
          boundsLat1: Number(formParque.boundsLat1),
          boundsLng1: Number(formParque.boundsLng1),
          boundsLat2: Number(formParque.boundsLat2),
          boundsLng2: Number(formParque.boundsLng2),
          mapTileUrl: formParque.mapTileUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setParques((prev) => [...prev, data]);
      setFormParque({ nombre: "", descripcion: "", boundsLat1: "", boundsLng1: "", boundsLat2: "", boundsLng2: "", mapTileUrl: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear parque");
    } finally {
      setLoading(null);
    }
  };

  const submitPunto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPunto.parqueId) return;
    setError(null);
    setLoading("punto");
    try {
      const res = await fetch(`/api/parques/${formPunto.parqueId}/puntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formPunto.nombre.trim(),
          tipo: formPunto.tipo.trim(),
          lat: Number(formPunto.lat),
          lng: Number(formPunto.lng),
          descripcion: formPunto.descripcion.trim() || undefined,
          orden: Number(formPunto.orden) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const parque = parques.find((p) => p.id === formPunto.parqueId);
      setPuntos((prev) => [...prev, { ...data, parque: { nombre: parque?.nombre ?? "" }, parqueId: formPunto.parqueId }]);
      setFormPunto((f) => ({ ...f, nombre: "", lat: "", lng: "", descripcion: "", orden: "0" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear punto");
    } finally {
      setLoading(null);
    }
  };

  const submitEspecie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEspecie.parqueId) return;
    setError(null);
    setLoading("especie");
    try {
      const res = await fetch(`/api/parques/${formEspecie.parqueId}/especies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formEspecie.nombre.trim(),
          tipo: formEspecie.tipo.trim(),
          descripcion: formEspecie.descripcion.trim() || undefined,
          imagenUrl: formEspecie.imagenUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const parque = parques.find((p) => p.id === formEspecie.parqueId);
      setEspecies((prev) => [...prev, { ...data, parque: { nombre: parque?.nombre ?? "" }, parqueId: formEspecie.parqueId }]);
      setFormEspecie((f) => ({ ...f, nombre: "", descripcion: "", imagenUrl: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear especie");
    } finally {
      setLoading(null);
    }
  };

  const submitUtil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUtil.parqueId) return;
    setError(null);
    setLoading("util");
    try {
      const res = await fetch(`/api/parques/${formUtil.parqueId}/utilidades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: formUtil.tipo.trim(),
          lat: Number(formUtil.lat),
          lng: Number(formUtil.lng),
          nombre: formUtil.nombre.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const parque = parques.find((p) => p.id === formUtil.parqueId);
      setUtilidades((prev) => [...prev, { ...data, parque: { nombre: parque?.nombre ?? "" }, parqueId: formUtil.parqueId }]);
      setFormUtil((f) => ({ ...f, lat: "", lng: "", nombre: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear utilidad");
    } finally {
      setLoading(null);
    }
  };

  const inputClass = "rounded-lg bg-slate-700 px-3 py-2 text-white text-sm w-full";
  const labelClass = "block text-slate-400 text-sm mb-1";
  const btnSm = "py-1.5 px-2 rounded text-xs font-medium";

  const deleteParque = async (id: string) => {
    if (!confirm("¿Eliminar este parque y todo su contenido?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/parques/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setParques((prev) => prev.filter((p) => p.id !== id));
      setPuntos((prev) => prev.filter((p) => p.parqueId !== id));
      setEspecies((prev) => prev.filter((e) => e.parqueId !== id));
      setUtilidades((prev) => prev.filter((u) => u.parqueId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };
  const deletePunto = async (p: PuntoRow) => {
    if (!confirm("¿Eliminar este punto?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/parques/${p.parqueId}/puntos/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setPuntos((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };
  const deleteEspecie = async (id: string) => {
    if (!confirm("¿Eliminar esta especie?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/especies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setEspecies((prev) => prev.filter((e) => e.id !== id));
      setPuntoEspecies((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };
  const deleteUtil = async (id: string) => {
    if (!confirm("¿Eliminar esta utilidad?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/utilidades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setUtilidades((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const loadPuntoEspecies = async (puntoId: string) => {
    setPuntoEspeciesPuntoId(puntoId);
    try {
      const res = await fetch(`/api/puntos/${puntoId}/especies`);
      const data = await res.json();
      setPuntoEspecies(Array.isArray(data) ? data : []);
    } catch {
      setPuntoEspecies([]);
    }
  };
  const addEspecieToPunto = async (puntoId: string, especieId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/puntos/${puntoId}/especies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ especieId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const especie = especies.find((e) => e.id === especieId);
      if (especie) setPuntoEspecies((prev) => [...prev, especie]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asociar");
    }
  };
  const removeEspecieFromPunto = async (puntoId: string, especieId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/puntos/${puntoId}/especies?especieId=${especieId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setPuntoEspecies((prev) => prev.filter((e) => e.id !== especieId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al desasociar");
    }
  };

  const openEditEspecie = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/especies/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setEditingEspecie(data);
      setEditEspecieForm({ nombre: data.nombre, tipo: data.tipo, descripcion: data.descripcion ?? "", imagenUrl: data.imagenUrl ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar especie");
    }
  };

  const saveEditEspecie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEspecie) return;
    setError(null);
    setLoading("edit-especie");
    try {
      const res = await fetch(`/api/especies/${editingEspecie.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editEspecieForm.nombre.trim(),
          tipo: editEspecieForm.tipo.trim(),
          descripcion: editEspecieForm.descripcion.trim() || null,
          imagenUrl: editEspecieForm.imagenUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setEspecies((prev) => prev.map((e) => (e.id === editingEspecie.id ? { ...e, nombre: data.nombre, tipo: data.tipo } : e)));
      setEditingEspecie(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(null);
    }
  };

  const addEspecieFoto = async (especieId: string, file: File) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: formData });
      const upData = await up.json();
      if (!upData.url) throw new Error("Error al subir");
      const res = await fetch(`/api/especies/${especieId}/fotos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upData.url }),
      });
      const foto = await res.json();
      if (!res.ok) throw new Error(foto.error || "Error");
      if (editingEspecie && editingEspecie.id === especieId) {
        setEditingEspecie((prev) => prev ? { ...prev, fotos: [...(prev.fotos || []), foto] } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir foto");
    }
  };

  const removeEspecieFoto = async (especieId: string, fotoId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/especies/${especieId}/fotos/${fotoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      if (editingEspecie && editingEspecie.id === especieId) {
        setEditingEspecie((prev) => prev ? { ...prev, fotos: (prev.fotos || []).filter((f) => f.id !== fotoId) } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar foto");
    }
  };

  return (
    <div className="space-y-10">
      {error && (
        <div className="p-4 rounded-xl bg-red-900/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">Parques ({parques.length})</h2>
        <form onSubmit={submitParque} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 rounded-xl bg-slate-800">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={formParque.nombre} onChange={(e) => setFormParque((f) => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>boundsLat1</label>
            <input type="number" step="any" className={inputClass} value={formParque.boundsLat1} onChange={(e) => setFormParque((f) => ({ ...f, boundsLat1: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>boundsLng1</label>
            <input type="number" step="any" className={inputClass} value={formParque.boundsLng1} onChange={(e) => setFormParque((f) => ({ ...f, boundsLng1: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>boundsLat2</label>
            <input type="number" step="any" className={inputClass} value={formParque.boundsLat2} onChange={(e) => setFormParque((f) => ({ ...f, boundsLat2: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>boundsLng2</label>
            <input type="number" step="any" className={inputClass} value={formParque.boundsLng2} onChange={(e) => setFormParque((f) => ({ ...f, boundsLng2: e.target.value }))} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción (opcional)</label>
            <input className={inputClass} value={formParque.descripcion} onChange={(e) => setFormParque((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button type="submit" disabled={!!loading} className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50">
              {loading === "parque" ? "..." : "Crear parque"}
            </button>
          </div>
        </form>
        <ul className="space-y-2 text-sm text-slate-400">
          {parques.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-slate-800/50">
              <span className="text-white">{p.nombre}</span> — bounds [{p.boundsLat1}, {p.boundsLng1}] / [{p.boundsLat2}, {p.boundsLng2}]
              <button type="button" onClick={() => deleteParque(p.id)} className={`${btnSm} bg-red-600/80 text-white hover:bg-red-500`}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">Puntos ({puntos.length})</h2>
        <form onSubmit={submitPunto} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 rounded-xl bg-slate-800">
          <div>
            <label className={labelClass}>Parque</label>
            <select className={inputClass} value={formPunto.parqueId} onChange={(e) => setFormPunto((f) => ({ ...f, parqueId: e.target.value }))} required>
              <option value="">Seleccionar</option>
              {parques.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={formPunto.nombre} onChange={(e) => setFormPunto((f) => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select className={inputClass} value={formPunto.tipo} onChange={(e) => setFormPunto((f) => ({ ...f, tipo: e.target.value }))}>
              <option value="mirador">mirador</option>
              <option value="descanso">descanso</option>
              <option value="inicio_sendero">inicio_sendero</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Orden</label>
            <input type="number" className={inputClass} value={formPunto.orden} onChange={(e) => setFormPunto((f) => ({ ...f, orden: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Lat</label>
            <input type="number" step="any" className={inputClass} value={formPunto.lat} onChange={(e) => setFormPunto((f) => ({ ...f, lat: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>Lng</label>
            <input type="number" step="any" className={inputClass} value={formPunto.lng} onChange={(e) => setFormPunto((f) => ({ ...f, lng: e.target.value }))} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción (opcional)</label>
            <input className={inputClass} value={formPunto.descripcion} onChange={(e) => setFormPunto((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button type="submit" disabled={!!loading || !formPunto.parqueId} className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50">
              {loading === "punto" ? "..." : "Crear punto"}
            </button>
          </div>
        </form>
        <ul className="space-y-2 text-sm text-slate-400">
          {puntos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-slate-800/50">
              <span className="text-white">{p.nombre}</span> ({p.tipo}) — {p.parque.nombre} [{p.lat}, {p.lng}]
              <button type="button" onClick={() => deletePunto(p)} className={`${btnSm} bg-red-600/80 text-white hover:bg-red-500`}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">Especies ({especies.length})</h2>
        <form onSubmit={submitEspecie} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 rounded-xl bg-slate-800">
          <div>
            <label className={labelClass}>Parque</label>
            <select className={inputClass} value={formEspecie.parqueId} onChange={(e) => setFormEspecie((f) => ({ ...f, parqueId: e.target.value }))} required>
              <option value="">Seleccionar</option>
              {parques.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={formEspecie.nombre} onChange={(e) => setFormEspecie((f) => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select className={inputClass} value={formEspecie.tipo} onChange={(e) => setFormEspecie((f) => ({ ...f, tipo: e.target.value }))}>
              <option value="árbol">árbol</option>
              <option value="planta">planta</option>
              <option value="animal">animal</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción (opcional)</label>
            <textarea className={inputClass} rows={2} value={formEspecie.descripcion} onChange={(e) => setFormEspecie((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>URL imagen principal (opcional)</label>
            <input className={inputClass} value={formEspecie.imagenUrl} onChange={(e) => setFormEspecie((f) => ({ ...f, imagenUrl: e.target.value }))} placeholder="/uploads/..." />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button type="submit" disabled={!!loading || !formEspecie.parqueId} className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50">
              {loading === "especie" ? "..." : "Crear especie"}
            </button>
          </div>
        </form>
        <ul className="space-y-2 text-sm text-slate-400">
          {especies.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-slate-800/50">
              <span className="text-white">{e.nombre}</span> ({e.tipo}) — {e.parque.nombre}
              <div className="flex gap-1">
                <button type="button" onClick={() => openEditEspecie(e.id)} className={`${btnSm} bg-slate-600 text-white hover:bg-slate-500`}>Editar</button>
                <button type="button" onClick={() => deleteEspecie(e.id)} className={`${btnSm} bg-red-600/80 text-white hover:bg-red-500`}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>

        {editingEspecie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditingEspecie(null)}>
            <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 shadow-xl" onClick={(ev) => ev.stopPropagation()}>
              <h3 className="text-lg font-medium text-white mb-4">Editar especie: {editingEspecie.nombre}</h3>
              <form onSubmit={saveEditEspecie} className="space-y-3">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input className={inputClass} value={editEspecieForm.nombre} onChange={(e) => setEditEspecieForm((f) => ({ ...f, nombre: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelClass}>Tipo</label>
                  <select className={inputClass} value={editEspecieForm.tipo} onChange={(e) => setEditEspecieForm((f) => ({ ...f, tipo: e.target.value }))}>
                    <option value="árbol">árbol</option>
                    <option value="planta">planta</option>
                    <option value="animal">animal</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Descripción</label>
                  <textarea className={inputClass} rows={4} value={editEspecieForm.descripcion} onChange={(e) => setEditEspecieForm((f) => ({ ...f, descripcion: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>URL imagen principal</label>
                  <input className={inputClass} value={editEspecieForm.imagenUrl} onChange={(e) => setEditEspecieForm((f) => ({ ...f, imagenUrl: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Fotos (slider)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(editingEspecie.fotos || []).map((f) => (
                      <div key={f.id} className="relative">
                        <img src={f.url} alt="" className="w-16 h-16 object-cover rounded-lg bg-slate-700" />
                        <button type="button" onClick={() => removeEspecieFoto(editingEspecie.id, f.id)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-none flex items-center justify-center" aria-label="Quitar foto">×</button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-slate-400 text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addEspecieFoto(editingEspecie.id, file);
                      e.target.value = "";
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1">Varias fotos se muestran como slider tipo Instagram.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={!!loading} className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50">
                    {loading === "edit-especie" ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" onClick={() => setEditingEspecie(null)} className="py-2 px-4 rounded-lg bg-slate-600 text-white text-sm font-medium">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">Especies por punto</h2>
        <div className="mb-4 p-4 rounded-xl bg-slate-800">
          <label className={labelClass}>Punto</label>
          <select
            className={`${inputClass} max-w-xs mb-3`}
            value={puntoEspeciesPuntoId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) loadPuntoEspecies(v);
              else {
                setPuntoEspeciesPuntoId(null);
                setPuntoEspecies([]);
              }
            }}
          >
            <option value="">Seleccionar punto</option>
            {puntos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} — {p.parque.nombre}</option>
            ))}
          </select>
          {puntoEspeciesPuntoId && (
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Especies en este punto:</p>
              <ul className="space-y-1">
                {puntoEspecies.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 py-1">
                    <span className="text-white">{e.nombre}</span> ({e.tipo})
                    <button type="button" onClick={() => removeEspecieFromPunto(puntoEspeciesPuntoId, e.id)} className={`${btnSm} bg-slate-600 text-white`}>Quitar</button>
                  </li>
                ))}
                {puntoEspecies.length === 0 && <p className="text-slate-500 text-sm">Ninguna</p>}
              </ul>
              <div className="flex gap-2 items-center mt-2">
                <select
                  className={`${inputClass} max-w-xs`}
                  id="add-especie-select"
                  onChange={(e) => {
                    const especieId = e.target.value;
                    if (especieId) {
                      addEspecieToPunto(puntoEspeciesPuntoId, especieId);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Agregar especie...</option>
                  {especies
                    .filter((e) => e.parqueId === puntos.find((p) => p.id === puntoEspeciesPuntoId)?.parqueId && !puntoEspecies.some((pe) => pe.id === e.id))
                    .map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre} ({e.tipo})</option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-slate-300 mb-4">Utilidades ({utilidades.length})</h2>
        <form onSubmit={submitUtil} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 rounded-xl bg-slate-800">
          <div>
            <label className={labelClass}>Parque</label>
            <select className={inputClass} value={formUtil.parqueId} onChange={(e) => setFormUtil((f) => ({ ...f, parqueId: e.target.value }))} required>
              <option value="">Seleccionar</option>
              {parques.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select className={inputClass} value={formUtil.tipo} onChange={(e) => setFormUtil((f) => ({ ...f, tipo: e.target.value }))}>
              <option value="sanitario">sanitario</option>
              <option value="emergencia">emergencia</option>
              <option value="salida">salida</option>
              <option value="camino">camino</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Lat</label>
            <input type="number" step="any" className={inputClass} value={formUtil.lat} onChange={(e) => setFormUtil((f) => ({ ...f, lat: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>Lng</label>
            <input type="number" step="any" className={inputClass} value={formUtil.lng} onChange={(e) => setFormUtil((f) => ({ ...f, lng: e.target.value }))} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre (opcional)</label>
            <input className={inputClass} value={formUtil.nombre} onChange={(e) => setFormUtil((f) => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button type="submit" disabled={!!loading || !formUtil.parqueId} className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50">
              {loading === "util" ? "..." : "Crear utilidad"}
            </button>
          </div>
        </form>
        <ul className="space-y-2 text-sm text-slate-400">
          {utilidades.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-slate-800/50">
              <span className="text-white">{u.tipo}</span> {u.nombre ?? ""} — {u.parque.nombre} [{u.lat}, {u.lng}]
              <button type="button" onClick={() => deleteUtil(u.id)} className={`${btnSm} bg-red-600/80 text-white hover:bg-red-500`}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
