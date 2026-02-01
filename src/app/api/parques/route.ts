import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
    return NextResponse.json(parques);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al listar parques" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    } = body as {
      nombre: string;
      descripcion?: string;
      boundsLat1: number;
      boundsLng1: number;
      boundsLat2: number;
      boundsLng2: number;
      mapTileUrl?: string;
    };
    if (!nombre || typeof boundsLat1 !== "number" || typeof boundsLng1 !== "number" || typeof boundsLat2 !== "number" || typeof boundsLng2 !== "number") {
      return NextResponse.json(
        { error: "Faltan nombre o bounds (boundsLat1, boundsLng1, boundsLat2, boundsLng2)" },
        { status: 400 }
      );
    }
    const parque = await prisma.parque.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        boundsLat1,
        boundsLng1,
        boundsLat2,
        boundsLng2,
        mapTileUrl: mapTileUrl?.trim() || null,
        activo: true,
      },
    });
    return NextResponse.json(parque);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear parque" },
      { status: 500 }
    );
  }
}
