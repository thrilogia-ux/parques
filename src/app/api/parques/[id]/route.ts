import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
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
    if (!parque) {
      return NextResponse.json({ error: "Parque no encontrado" }, { status: 404 });
    }
    const puntos = parque.puntos.map((p) => {
      const { especies: pes, ...rest } = p as typeof p & {
        especies: { especie: { id: string; nombre: string; tipo: string; descripcion: string | null; imagenUrl: string | null } }[];
      };
      return { ...rest, especies: pes.map((pe) => pe.especie) };
    });
    return NextResponse.json({ ...parque, puntos });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al obtener parque" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const {
      nombre,
      descripcion,
      boundsLat1,
      boundsLng1,
      boundsLat2,
      boundsLng2,
      mapTileUrl,
      activo,
    } = body;
    const parque = await prisma.parque.update({
      where: { id },
      data: {
        ...(nombre != null && { nombre: String(nombre).trim() }),
        ...(descripcion != null && { descripcion: String(descripcion).trim() || null }),
        ...(typeof boundsLat1 === "number" && { boundsLat1 }),
        ...(typeof boundsLng1 === "number" && { boundsLng1 }),
        ...(typeof boundsLat2 === "number" && { boundsLat2 }),
        ...(typeof boundsLng2 === "number" && { boundsLng2 }),
        ...(mapTileUrl != null && { mapTileUrl: String(mapTileUrl).trim() || null }),
        ...(typeof activo === "boolean" && { activo }),
      },
    });
    return NextResponse.json(parque);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al actualizar parque" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.parque.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al eliminar parque" },
      { status: 500 }
    );
  }
}
