import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const foto = await prisma.foto.update({
      where: { id },
      data: { moderado: true },
    });
    return NextResponse.json(foto);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al aprobar foto" },
      { status: 500 }
    );
  }
}
