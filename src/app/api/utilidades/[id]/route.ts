import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { tipo, lat, lng, nombre } = body;
    const item = await prisma.utilityLayerItem.update({
      where: { id },
      data: {
        ...(tipo != null && { tipo: String(tipo).trim() }),
        ...(typeof lat === "number" && { lat }),
        ...(typeof lng === "number" && { lng }),
        ...(nombre != null && { nombre: String(nombre).trim() || null }),
      },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al actualizar utilidad" },
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
    await prisma.utilityLayerItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al eliminar utilidad" },
      { status: 500 }
    );
  }
}
