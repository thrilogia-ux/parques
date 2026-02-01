# Parques Nacionales – Plataforma digital

Aplicación web móvil (PWA) para dar valor a los recorridos en Parques Nacionales. Los visitantes escanean un QR en totems y acceden a:

- **Mapa del parque** con geolocalización en tiempo real
- **Puntos de interés** (totems) con ficha: nombre, descripción, especies asociadas
- **Qué estás viendo**: puntos y especies cercanas según tu ubicación GPS
- **Capas**: puntos, sanitarios, emergencia, salidas, caminos
- **Fotos** por punto, **mensajes** a futuros visitantes, **compartir** en redes

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd parques-app
npm install
```

Crear `.env` con:

```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generar cliente Prisma y crear la base:

```bash
npx prisma generate
npx prisma db push
```

Cargar datos de ejemplo:

```bash
npm run db:seed
```

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Para ir al mapa del parque demo: [http://localhost:3000/p/parque-demo-1](http://localhost:3000/p/parque-demo-1).

## URLs y QR

- **Solo parque:** `/p/{idParque}` → mapa del parque
- **Parque + punto (totem):** `/p/{idParque}?punto={idPunto}` o `/p/{idParque}/punto/{idPunto}` → mapa centrado en el punto y ficha abierta

Ejemplo de URL para un totem:  
`https://tu-dominio.com/p/parque-demo-1/punto/punto-mirador-1`

## Estructura

- **Backend:** Next.js API Routes en `src/app/api/`
- **Base de datos:** Prisma + SQLite (schema en `prisma/schema.prisma`)
- **Frontend:** App Router, mapa con Leaflet (cargado en cliente), PWA con `manifest.json` y `public/sw.js`

## Scripts

- `npm run dev` – servidor de desarrollo
- `npm run build` – build de producción
- `npm run start` – servidor de producción
- `npm run db:push` – aplicar schema a la DB
- `npm run db:seed` – ejecutar seed (parque demo)

## Admin

- **Moderación** (`/admin`): mensajes y fotos pendientes de aprobación. Las fotos subidas por visitantes quedan con `moderado: false` hasta que un moderador las apruebe (enlace "Moderación" en la página de inicio).
- **Contenido** (`/admin/contenido`): gestión de parques, puntos, especies y utilidades. Crear y eliminar (las APIs PATCH permiten editar vía cliente HTTP si se necesita). Sección **Especies por punto** para asociar especies a un punto (aparecen en la ficha del punto en la app).
- **Protección**: si definís `ADMIN_PASSWORD` en `.env`, al entrar a `/admin` o `/admin/contenido` se redirige a `/admin/login` hasta ingresar la contraseña. Si no definís `ADMIN_PASSWORD`, el admin queda abierto.

## Subir a GitHub

Repositorio: [https://github.com/thrilogia-ux/parques](https://github.com/thrilogia-ux/parques.git)

Desde la carpeta `parques-app`:

```bash
cd parques-app
git init
git add .
git commit -m "Parques Nacionales - PWA mapa, admin, moderación"
git branch -M main
git remote add origin https://github.com/thrilogia-ux/parques.git
git push -u origin main
```

Si el repo en GitHub ya tiene un README y querés reemplazarlo con este proyecto:

```bash
git push -u origin main --force
```

(Usá `--force` solo si estás seguro de sobrescribir el contenido remoto.)

## Despliegue (Vercel)

1. Subí el proyecto a GitHub y conectalo a [Vercel](https://vercel.com).
2. En **Settings → Environment Variables** definí:
   - `DATABASE_URL`: para producción conviene usar **Vercel Postgres** o **PlanetScale/Neon**. Si usás Postgres, en `prisma/schema.prisma` cambiá `provider = "sqlite"` por `provider = "postgresql"` y la URL que te da el proveedor.
   - `NEXT_PUBLIC_APP_URL`: la URL de la app (ej. `https://parques.vercel.app`).
   - `ADMIN_PASSWORD`: (opcional) contraseña del admin.
3. En el build, Vercel ejecuta `npm run build`; el `postinstall` corre `prisma generate`. Si usás Postgres, después del primer deploy ejecutá las migraciones o `prisma db push` desde tu máquina apuntando a la DB de producción, y luego `npm run db:seed` si querés datos iniciales.
4. Copiá `.env.example` a `.env` local para referencia de variables.

## PWA

La app incluye `manifest.json` y un service worker (`public/sw.js`) que precachea la página principal y el manifest, y cachea en visita las rutas y APIs del parque para uso offline. Hay un ícono SVG en `public/icons/icon.svg`; opcionalmente añadí `icon-192.png` e `icon-512.png` en `public/icons/` para navegadores que no usen SVG en el manifest.
