using MagenttaOne.Api.Models;

namespace MagenttaOne.Api.Data;

/// <summary>
/// Seeds initial data including legacy migration simulation.
/// Legacy rule: records that had "MedioTiempo" as Modalidad are migrated to
/// Modalidad = Presencial + Jornada = MedioTiempo. All others default to Jornada = TiempoCompleto.
/// </summary>
public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Puestos.Any()) return;

        // Simulate legacy data migration:
        // Record #3 originally had Modalidad = "MedioTiempo" in the old schema.
        // Migration rule: MedioTiempo -> Modalidad = Presencial, Jornada = MedioTiempo.
        // All others keep their original Modalidad and get Jornada = TiempoCompleto.

        var puestos = new List<Puesto>
        {
            new()
            {
                Area = "Gerencia de Operaciones",
                Nombre = "Tecnico Instalador",
                Nivel = NivelPuesto.Sr,
                Modalidad = Modalidad.Presencial,
                Jornada = Jornada.TiempoCompleto,
                SalarioReferencia = 12000m,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Area = "Desarrollo de Sistemas",
                Nombre = "Ingeniero en Sistemas",
                Nivel = NivelPuesto.Sr,
                Modalidad = Modalidad.Remoto,
                Jornada = Jornada.TiempoCompleto,
                SalarioReferencia = 20000m,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            },
            // LEGACY MIGRATION: This record originally had Modalidad = "MedioTiempo".
            // Mapped to: Modalidad = Presencial, Jornada = MedioTiempo
            new()
            {
                Area = "Gerencia de Administracion",
                Nombre = "Mantenimiento y Limpieza",
                Nivel = NivelPuesto.SinNivel,
                Modalidad = Modalidad.Presencial,
                Jornada = Jornada.MedioTiempo,
                SalarioReferencia = null,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Area = "Gerencia de Ventas",
                Nombre = "Ejecutiva Corporativa",
                Nivel = NivelPuesto.Sr,
                Modalidad = Modalidad.Hibrido,
                Jornada = Jornada.TiempoCompleto,
                SalarioReferencia = 16000m,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Area = "Gerencia de Operaciones",
                Nombre = "Tecnico de Impresion",
                Nivel = NivelPuesto.Jr,
                Modalidad = Modalidad.Presencial,
                Jornada = Jornada.MedioTiempo,
                SalarioReferencia = 9000m,
                Activo = false,
                FechaCreacion = DateTime.UtcNow
            }
        };

        context.Puestos.AddRange(puestos);
        context.SaveChanges();
    }
}
