# Prueba Técnica — Magenttaone

Aplicación full-stack para gestión de puestos de trabajo. Desarrollada como prueba técnica para Magenttaone.

## Stack

**Backend:** C# · Minimal API · SQLite · Entity Framework Core · FluentValidation  
**Frontend:** React · TypeScript · Tailwind CSS v4

## Funcionalidades

- CRUD completo de puestos de trabajo (Puestos)
- Validación robusta en backend con FluentValidation
- Búsqueda con debounce en el frontend
- Modal para creación y edición
- Manejo de errores y estados de carga

## Estructura del proyecto

```
/
├── backend/
│   ├── Models/          # Entidades de base de datos
│   ├── Dtos/            # Data Transfer Objects
│   ├── Data/            # DbContext y configuración EF Core
│   ├── Validators/      # Reglas FluentValidation
│   └── Migrations/      # Migraciones de SQLite
└── frontend/
    └── src/
        ├── components/
        │   ├── PuestosTable.tsx   # Tabla principal con paginación
        │   └── PuestoModal.tsx    # Modal de creación/edición
        └── App.tsx                # Estado global y lógica principal
```

## Inicio rápido

### Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

La API corre en `http://localhost:5000` por defecto.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app corre en `http://localhost:5173` por defecto.

## API — Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/puestos` | Listar todos los puestos |
| `GET` | `/puestos/{id}` | Obtener puesto por ID |
| `POST` | `/puestos` | Crear nuevo puesto |
| `PUT` | `/puestos/{id}` | Actualizar puesto |
| `DELETE` | `/puestos/{id}` | Eliminar puesto |

## Detalles técnicos

- **Debounce**: implementado con `useRef` + `setTimeout` para la búsqueda en tiempo real sin peticiones excesivas al backend
- **Base de datos**: SQLite embebida — no requiere instalación de servidor
- **Validación**: FluentValidation en backend + validación de formulario en frontend
- **ORM**: Entity Framework Core con Code First y migraciones automáticas