using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MagenttaOne.Api.Data;
using MagenttaOne.Api.Dtos;
using MagenttaOne.Api.Models;
using MagenttaOne.Api.Validators;

var builder = WebApplication.CreateBuilder(args);

// JSON: enums as strings
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// EF Core + SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=magenttaone.db"));

// FluentValidation
builder.Services.AddScoped<IValidator<CreatePuestoDto>, CreatePuestoValidator>();
builder.Services.AddScoped<IValidator<UpdatePuestoDto>, UpdatePuestoValidator>();

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations and seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
        db.Database.Migrate();
    else
        db.Database.EnsureCreated();
    DbSeeder.Seed(db);
}

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Helpers ---
static PuestoDto ToDto(Puesto p) => new()
{
    Id = p.Id,
    Area = p.Area,
    Nombre = p.Nombre,
    Nivel = p.Nivel,
    Modalidad = p.Modalidad,
    Jornada = p.Jornada,
    SalarioReferencia = p.SalarioReferencia,
    Activo = p.Activo,
    FechaCreacion = p.FechaCreacion
};

// --- Endpoints ---

// GET /api/puestos?nombre=&activo=
app.MapGet("/api/puestos", async (AppDbContext db, string? nombre, bool? activo) =>
{
    var query = db.Puestos.AsQueryable();

    if (!string.IsNullOrWhiteSpace(nombre))
        query = query.Where(p => p.Nombre.ToLower().Contains(nombre.ToLower()));

    if (activo.HasValue)
        query = query.Where(p => p.Activo == activo.Value);

    var puestos = await query.OrderByDescending(p => p.FechaCreacion).ToListAsync();
    return Results.Ok(puestos.Select(ToDto));
})
.WithName("GetPuestos")
.WithOpenApi();

// GET /api/puestos/{id}
app.MapGet("/api/puestos/{id:int}", async (AppDbContext db, int id) =>
{
    var puesto = await db.Puestos.FindAsync(id);
    return puesto is null ? Results.NotFound() : Results.Ok(ToDto(puesto));
})
.WithName("GetPuesto")
.WithOpenApi();

// POST /api/puestos
app.MapPost("/api/puestos", async (AppDbContext db, IValidator<CreatePuestoDto> validator, CreatePuestoDto dto) =>
{
    var validation = await validator.ValidateAsync(dto);
    if (!validation.IsValid)
        return Results.ValidationProblem(validation.ToDictionary());

    // Check unique constraint: same Nombre + Area among active records (case-insensitive)
    var exists = await db.Puestos.AnyAsync(p =>
        p.Activo &&
        p.Nombre.ToLower() == dto.Nombre.ToLower() &&
        p.Area.ToLower() == dto.Area.ToLower());

    if (exists)
    {
        return Results.Problem(
            title: "Conflicto",
            detail: $"Ya existe un puesto activo con el nombre '{dto.Nombre}' en el area '{dto.Area}'.",
            statusCode: 409);
    }

    var puesto = new Puesto
    {
        Area = dto.Area,
        Nombre = dto.Nombre,
        Nivel = dto.Nivel,
        Modalidad = dto.Modalidad,
        Jornada = dto.Jornada,
        SalarioReferencia = dto.SalarioReferencia,
        Activo = true,
        FechaCreacion = DateTime.UtcNow
    };

    db.Puestos.Add(puesto);
    await db.SaveChangesAsync();

    return Results.Created($"/api/puestos/{puesto.Id}", ToDto(puesto));
})
.WithName("CreatePuesto")
.WithOpenApi();

// PUT /api/puestos/{id}
app.MapPut("/api/puestos/{id:int}", async (AppDbContext db, IValidator<UpdatePuestoDto> validator, int id, UpdatePuestoDto dto) =>
{
    var puesto = await db.Puestos.FindAsync(id);
    if (puesto is null) return Results.NotFound();

    var validation = await validator.ValidateAsync(dto);
    if (!validation.IsValid)
        return Results.ValidationProblem(validation.ToDictionary());

    // Check unique constraint excluding current record
    var exists = await db.Puestos.AnyAsync(p =>
        p.Id != id &&
        p.Activo &&
        p.Nombre.ToLower() == dto.Nombre.ToLower() &&
        p.Area.ToLower() == dto.Area.ToLower());

    if (exists)
    {
        return Results.Problem(
            title: "Conflicto",
            detail: $"Ya existe un puesto activo con el nombre '{dto.Nombre}' en el area '{dto.Area}'.",
            statusCode: 409);
    }

    puesto.Area = dto.Area;
    puesto.Nombre = dto.Nombre;
    puesto.Nivel = dto.Nivel;
    puesto.Modalidad = dto.Modalidad;
    puesto.Jornada = dto.Jornada;
    puesto.SalarioReferencia = dto.SalarioReferencia;

    await db.SaveChangesAsync();

    return Results.Ok(ToDto(puesto));
})
.WithName("UpdatePuesto")
.WithOpenApi();

// DELETE /api/puestos/{id} (soft delete)
app.MapDelete("/api/puestos/{id:int}", async (AppDbContext db, int id) =>
{
    var puesto = await db.Puestos.FindAsync(id);
    if (puesto is null) return Results.NotFound();

    puesto.Activo = false;
    await db.SaveChangesAsync();

    return Results.NoContent();
})
.WithName("DeletePuesto")
.WithOpenApi();

app.Run();

// Needed for WebApplicationFactory in integration tests
public partial class Program { }
