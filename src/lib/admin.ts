import { prisma } from "@/lib/prisma";

export async function getContentForAdmin() {
  const [parques, puntos, especies, utilidades] = await Promise.all([
    prisma.parque.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        boundsLat1: true,
        boundsLng1: true,
        boundsLat2: true,
        boundsLng2: true,
      },
    }),
    prisma.punto.findMany({
      orderBy: [{ parqueId: "asc" }, { orden: "asc" }],
      include: { parque: { select: { nombre: true } } },
    }),
    prisma.especie.findMany({
      orderBy: [{ parqueId: "asc" }, { nombre: "asc" }],
      include: { parque: { select: { nombre: true } } },
    }),
    prisma.utilityLayerItem.findMany({
      orderBy: [{ parqueId: "asc" }, { tipo: "asc" }],
      include: { parque: { select: { nombre: true } } },
    }),
  ]);
  return { parques, puntos, especies, utilidades };
}

export async function getUnmoderated() {
  const [mensajes, fotos] = await Promise.all([
    prisma.mensaje.findMany({
      where: { moderado: false },
      orderBy: { createdAt: "desc" },
      include: {
        punto: { select: { nombre: true, parque: { select: { nombre: true } } } },
      },
    }),
    prisma.foto.findMany({
      where: { moderado: false },
      orderBy: { createdAt: "desc" },
      include: {
        punto: { select: { nombre: true } },
        parque: { select: { nombre: true } },
      },
    }),
  ]);
  return { mensajes, fotos };
}
