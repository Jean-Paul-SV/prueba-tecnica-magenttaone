# MagenttaOne - Modulo RRHH - Arquitectura Organizacional

**Autor:** Jean Paul Serrato
**Licencia:** Todos los derechos reservados © 2026 Jean Paul Serrato

Mini-CRUD full-stack del recurso **Puesto de Trabajo** con separacion correcta de **Modalidad** y **Jornada**.

## Stack y versiones

- **Backend:** .NET 8.0 / ASP.NET Core (Minimal API) / Entity Framework Core 8.0 / SQLite
- **Frontend:** React 18 / TypeScript / Tailwind CSS v4 / Vite
- **Validacion:** FluentValidation 11.3

## Prerrequisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (version 8.0.x)
- [Node.js](https://nodejs.org/) (version 18+ recomendado)
- npm (incluido con Node.js)

## Ejecucion del Backend

```bash
cd backend
dotnet run
```

El API se levanta en: **http://localhost:5018**

Swagger UI disponible en: **http://localhost:5018/swagger**

> La base de datos SQLite (`magenttaone.db`) se crea automaticamente al iniciar mediante migraciones de EF Core (`Database.Migrate()`). El seed pobla 5 registros de prueba si la tabla esta vacia, incluyendo la simulacion de migracion de datos legacy.

## Ejecucion del Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se levanta en: **http://localhost:5173**

> El proxy de Vite redirige las llamadas a `/api/*` hacia `http://localhost:5018` automaticamente.

## URLs locales

| Servicio         | URL                              |
|------------------|----------------------------------|
| Frontend         | http://localhost:5173             |
| API REST         | http://localhost:5018/api/puestos |
| Swagger UI       | http://localhost:5018/swagger     |

## Endpoints del API

| Metodo   | Ruta                  | Descripcion                                |
|----------|-----------------------|--------------------------------------------|
| `GET`    | `/api/puestos`        | Lista puestos (filtros: `?nombre=`, `?activo=`) |
| `GET`    | `/api/puestos/{id}`   | Detalle de un puesto                       |
| `POST`   | `/api/puestos`        | Crear puesto                               |
| `PUT`    | `/api/puestos/{id}`   | Actualizar puesto                          |
| `DELETE` | `/api/puestos/{id}`   | Soft delete (Activo = false)               |

## Notas adicionales

- El backend aplica migraciones EF Core al iniciar (`Database.Migrate()`). No es necesario ejecutar comandos de migracion manuales.
- Los enums se serializan como strings en el JSON para mayor legibilidad.
- La validacion de unicidad (Nombre + Area) solo aplica a puestos activos (case-insensitive).
- El seed incluye un registro que simula la migracion de datos legacy donde "MedioTiempo" era una opcion de Modalidad, mapeado a `Modalidad = Presencial` + `Jornada = MedioTiempo`.
- El frontend incluye validacion de campos obligatorios antes de enviar al API.
