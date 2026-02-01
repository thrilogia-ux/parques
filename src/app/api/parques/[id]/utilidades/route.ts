import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: parqueId } = await params;
  try {
    const parque = await prisma.parque.findUnique({ where: { id: parqueId } });
    if (!parque) {
      return NextResponse.json({ error: "Parque no encontrado" }, { status: 404 });
    }
    const body = await req.json();
    const { tipo, lat, lng, nombre } = body as {
      tipo: string;
      lat: number;
      lng: number;
      nombre?: string;
    };
    if (!tipo?.trim() || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Faltan tipo, lat o lng" },
        { status: 400 }
      );
    }
    const item = await prisma.utilityLayerItem.create({
      data: {
        parqueId,
        tipo: tipo.trim(),
        lat,
        lng,
        nombre: nombre?.trim() || null,
      },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear utilidad" },
      { status: 500 }
    );
  }
}
