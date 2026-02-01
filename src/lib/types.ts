export type Parque = {
  id: string;
  nombre: string;
  descripcion: string | null;
  boundsLat1: number;
  boundsLng1: number;
  boundsLat2: number;
  boundsLng2: number;
  mapTileUrl: string | null;
  puntos?: Punto[];
  especies?: Especie[];
  utilityLayerItems?: UtilityLayerItem[];
};

export type Punto = {
  id: string;
  parqueId: string;
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
  descripcion: string | null;
  orden: number;
  especies?: Especie[];
  mensajes?: Mensaje[];
};

export type EspecieFoto = {
  id: string;
  especieId: string;
  url: string;
  orden: number;
};

export type Especie = {
  id: string;
  parqueId: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  imagenUrl: string | null;
  fotos?: EspecieFoto[];
};

export type UtilityLayerItem = {
  id: string;
  parqueId: string;
  tipo: string;
  lat: number;
  lng: number;
  nombre: string | null;
};

export type Mensaje = {
  id: string;
  puntoId: string;
  autor: string | null;
  texto: string;
  moderado: boolean;
  createdAt: string;
};

export type Foto = {
  id: string;
  puntoId: string | null;
  parqueId: string;
  url: string;
  autor: string | null;
  moderado: boolean;
  createdAt: string;
};

export type NearbyResponse = {
  puntos: (Punto & { distanceKm: number })[];
  especiesCercanas: Especie[];
};

export type PuntoConEspecies = Punto & { especies?: Especie[] };
