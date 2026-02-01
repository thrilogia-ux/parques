import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const mensaje = await prisma.mensaje.update({
      where: { id },
      data: { moderado: true },
    });
    return NextResponse.json(mensaje);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al aprobar mensaje" },
      { status: 500 }
    );
  }
}
