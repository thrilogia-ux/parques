import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fotoId: string }> }
) {
  const { id: especieId, fotoId } = await params;
  try {
    await prisma.especieFoto.deleteMany({
      where: { id: fotoId, especieId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar foto" }, { status: 500 });
  }
}
