import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: parqueId } = await params;
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  const radiusKm = Number(req.nextUrl.searchParams.get("radius")) || 2;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "Se requieren lat y lng" },
      { status: 400 }
    );
  }

  try {
    const [puntos, especies] = await Promise.all([
      prisma.punto.findMany({
        where: { parqueId },
        include: { especies: { include: { especie: { include: { fotos: { orderBy: { orden: "asc" } } } } } } },
      }),
      prisma.especie.findMany({
        where: { parqueId },
        include: { fotos: { orderBy: { orden: "asc" } } },
      }),
    ]);

    const puntosConDistancia = puntos
      .map((p) => ({
        ...p,
        distanceKm: haversineKm(lat, lng, p.lat, p.lng),
      }))
      .filter((p) => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 15)
      .map(({ distanceKm, especies: pes, ...p }) => ({
        ...p,
        distanceKm,
        especies: pes.map((pe) => pe.especie),
      }));

    return NextResponse.json({
      puntos: puntosConDistancia,
      especiesCercanas: especies.slice(0, 20),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al obtener puntos cercanos" },
      { status: 500 }
    );
  }
}
