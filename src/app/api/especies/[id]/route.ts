import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const especie = await prisma.especie.findUnique({
      where: { id },
      include: { fotos: { orderBy: { orden: "asc" } } },
    });
    if (!especie) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json(especie);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener especie" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { nombre, tipo, descripcion, imagenUrl } = body;
    const especie = await prisma.especie.update({
      where: { id },
      data: {
        ...(nombre != null && { nombre: String(nombre).trim() }),
        ...(tipo != null && { tipo: String(tipo).trim() }),
        ...(descripcion != null && { descripcion: String(descripcion).trim() || null }),
        ...(imagenUrl != null && { imagenUrl: String(imagenUrl).trim() || null }),
      },
    });
    return NextResponse.json(especie);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al actualizar especie" },
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
    await prisma.especie.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al eliminar especie" },
      { status: 500 }
    );
  }
}
