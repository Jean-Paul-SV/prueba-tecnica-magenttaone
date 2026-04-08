# Decisiones Tecnicas

**Candidato:** Jean Paul Serrato

## 1. Decisiones arquitectonicas y por que

**Backend - Minimal API:** Elegí Minimal API sobre Controllers porque el alcance es un solo recurso (Puesto) con 5 endpoints. Minimal API reduce el boilerplate sin sacrificar claridad. Para un modulo completo con multiples recursos, migraria a Controllers con una estructura por feature.

**Estructura de carpetas:** El backend se organiza en `Models/`, `Dtos/`, `Data/`, `Validators/`, `Migrations/`. Los DTOs separan la representacion del API de la entidad de dominio. FluentValidation centraliza las reglas de validacion fuera de la entidad.

**SQLite con migraciones EF Core:** Se usan migraciones formales (`dotnet ef migrations add`) aplicadas al iniciar con `Database.Migrate()`. El seed pobla datos de prueba si la tabla esta vacia, incluyendo la simulacion de migracion legacy.

**Frontend - Componentes planos:** La UI se compone de `App.tsx` (estado y orquestacion), `PuestosTable.tsx` (tabla) y `PuestoModal.tsx` (formulario). Sin librerias de estado externas ni React Query, dado que un solo recurso no lo justifica. El debounce del filtro usa `useRef` + `setTimeout`.

**Tailwind CSS v4:** Se usa con el plugin de Vite, sin archivo de configuracion adicional. Los colores del prototipo (magenta #C2185B como primario) se aplican con variables CSS custom en `@theme`.

**Migracion de datos legacy:** La regla del ticket (MedioTiempo como Modalidad -> Presencial + MedioTiempo) se simula en el seeder. El registro #3 (Mantenimiento y Limpieza) representa un puesto que tenia `Modalidad = "MedioTiempo"` y fue mapeado a `Modalidad = Presencial` + `Jornada = MedioTiempo`. En produccion, esto seria una migracion SQL durante el deploy.

## 2. Que haria diferente con una semana completa

- **Tests unitarios** para validadores y reglas de negocio, tests de integracion para endpoints.
- **React Query** para cache, invalidacion y estados de carga.
- **Wizard de 3 pasos** en el modal, fiel al prototipo original.
- **Middleware de excepciones** que devuelva ProblemDetails estandarizado.
- **Docker Compose** para levantar el stack con un solo comando.
- **Paginacion** en el endpoint de lista.

## 3. Como escalaria al modulo completo de RRHH

Adoptaria una **arquitectura por feature**: cada submodulo (Contratos, Nomina, Asistencias) con su propia carpeta de entidades, DTOs, validadores y endpoints. Las entidades compartidas como `Puesto` vivirian en un proyecto `Domain` comun. Usaria Repository + Unit of Work para desacoplar logica de negocio del acceso a datos. En frontend, cada submodulo seria un modulo lazy-loaded con su propio routing. La entidad Puesto se convertiria en FK referenciada desde Contratos, Descripciones de Puesto y Vacantes.

---

**Uso de IA:** Se utilizo Claude Code como asistente para scaffolding y componentes. Todo el codigo fue revisado y validado manualmente.
