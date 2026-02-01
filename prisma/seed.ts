import { PrismaClient } from "../src/generated/prisma-client";

const prisma = new PrismaClient();

async function main() {
  const parque = await prisma.parque.upsert({
    where: { id: "parque-demo-1" },
    update: {},
    create: {
      id: "parque-demo-1",
      nombre: "Parque Nacional Demo",
      descripcion:
        "Parque de demostración para la plataforma digital. Escanea el QR en los totems para explorar.",
      boundsLat1: -41.15,
      boundsLng1: -71.35,
      boundsLat2: -41.08,
      boundsLng2: -71.25,
      mapTileUrl: null,
      activo: true,
    },
  });

  const [p1, p2, p3] = await Promise.all([
    prisma.punto.upsert({
      where: { id: "punto-mirador-1" },
      update: {},
      create: {
        id: "punto-mirador-1",
        parqueId: parque.id,
        nombre: "Mirador Norte",
        tipo: "mirador",
        lat: -41.12,
        lng: -71.30,
        descripcion: "Vista panorámica del lago y la cordillera.",
        orden: 1,
      },
    }),
    prisma.punto.upsert({
      where: { id: "punto-descanso-1" },
      update: {},
      create: {
        id: "punto-descanso-1",
        parqueId: parque.id,
        nombre: "Área de descanso Central",
        tipo: "descanso",
        lat: -41.10,
        lng: -71.28,
        descripcion: "Zona con bancos y sombra. Ideal para reponer energías.",
        orden: 2,
      },
    }),
    prisma.punto.upsert({
      where: { id: "punto-sendero-1" },
      update: {},
      create: {
        id: "punto-sendero-1",
        parqueId: parque.id,
        nombre: "Inicio Sendero Bosque",
        tipo: "inicio_sendero",
        lat: -41.11,
        lng: -71.29,
        descripcion: "Comienzo del sendero que recorre el bosque de arrayanes.",
        orden: 3,
      },
    }),
  ]);

  const [e1, e2, e3] = await Promise.all([
    prisma.especie.upsert({
      where: { id: "especie-1" },
      update: {},
      create: {
        id: "especie-1",
        parqueId: parque.id,
        nombre: "Arrayán",
        tipo: "árbol",
        descripcion: "Árbol autóctono de corteza color canela.",
        imagenUrl: null,
      },
    }),
    prisma.especie.upsert({
      where: { id: "especie-2" },
      update: {},
      create: {
        id: "especie-2",
        parqueId: parque.id,
        nombre: "Huemul",
        tipo: "animal",
        descripcion: "Ciervo nativo de la Patagonia.",
        imagenUrl: null,
      },
    }),
    prisma.especie.upsert({
      where: { id: "especie-3" },
      update: {},
      create: {
        id: "especie-3",
        parqueId: parque.id,
        nombre: "Notro",
        tipo: "planta",
        descripcion: "Arbusto de flores rojas.",
        imagenUrl: null,
      },
    }),
  ]);

  try {
    await prisma.puntoEspecie.createMany({
      data: [
        { puntoId: p1.id, especieId: e1.id },
        { puntoId: p1.id, especieId: e2.id },
        { puntoId: p3.id, especieId: e1.id },
      ],
    });
  } catch {
    // ya existen en re-runs
  }

  await Promise.all([
    prisma.utilityLayerItem.upsert({
      where: { id: "util-sanitario-1" },
      update: {},
      create: {
        id: "util-sanitario-1",
        parqueId: parque.id,
        tipo: "sanitario",
        lat: -41.105,
        lng: -71.285,
        nombre: "Baños Central",
      },
    }),
    prisma.utilityLayerItem.upsert({
      where: { id: "util-emergencia-1" },
      update: {},
      create: {
        id: "util-emergencia-1",
        parqueId: parque.id,
        tipo: "emergencia",
        lat: -41.12,
        lng: -71.30,
        nombre: "Puesto Guardaparques",
      },
    }),
    prisma.utilityLayerItem.upsert({
      where: { id: "util-salida-1" },
      update: {},
      create: {
        id: "util-salida-1",
        parqueId: parque.id,
        tipo: "salida",
        lat: -41.08,
        lng: -71.26,
        nombre: "Salida Este",
      },
    }),
    prisma.utilityLayerItem.upsert({
      where: { id: "util-camino-1" },
      update: {},
      create: {
        id: "util-camino-1",
        parqueId: parque.id,
        tipo: "camino",
        lat: -41.115,
        lng: -71.295,
        nombre: "Sendero al Mirador",
      },
    }),
    prisma.utilityLayerItem.upsert({
      where: { id: "util-camino-2" },
      update: {},
      create: {
        id: "util-camino-2",
        parqueId: parque.id,
        tipo: "camino",
        lat: -41.11,
        lng: -71.29,
        nombre: "Cruce Central",
      },
    }),
    prisma.utilityLayerItem.upsert({
      where: { id: "util-camino-3" },
      update: {},
      create: {
        id: "util-camino-3",
        parqueId: parque.id,
        tipo: "camino",
        lat: -41.105,
        lng: -71.28,
        nombre: "Tramo Descanso",
      },
    }),
  ]);

  const e4 = await prisma.especie.upsert({
    where: { id: "especie-4" },
    update: {},
    create: {
      id: "especie-4",
      parqueId: parque.id,
      nombre: "Coihue",
      tipo: "árbol",
      descripcion: "Árbol de hoja perenne, típico del bosque andino.",
      imagenUrl: null,
    },
  });
  try {
    await prisma.puntoEspecie.createMany({
      data: [
        { puntoId: p2.id, especieId: e4.id },
        { puntoId: p3.id, especieId: e3.id },
      ],
    });
  } catch {
    // ya existen
  }

  console.log("Seed OK:", parque.nombre);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
