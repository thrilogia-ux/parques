import { prisma } from "@/lib/prisma";

export async function getParqueById(id: string) {
  const parque = await prisma.parque.findUnique({
    where: { id, activo: true },
    include: {
      puntos: {
        orderBy: { orden: "asc" },
        include: { especies: { include: { especie: true } } },
      },
      especies: true,
      utilityLayerItems: true,
    },
  });
  if (!parque) return null;
  const puntos = parque.puntos.map((p) => {
    const { especies: pes, ...rest } = p as typeof p & {
      especies: { especie: { id: string; nombre: string; tipo: string; descripcion: string | null; imagenUrl: string | null } }[];
    };
    return { ...rest, especies: pes.map((pe) => pe.especie) };
  });
  return { ...parque, puntos };
}

export async function getParquesList() {
  const parques = await prisma.parque.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      boundsLat1: true,
      boundsLng1: true,
      boundsLat2: true,
      boundsLng2: true,
      mapTileUrl: true,
    },
  });
  return parques;
}
