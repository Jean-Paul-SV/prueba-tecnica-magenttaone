using Microsoft.EntityFrameworkCore;
using MagenttaOne.Api.Models;

namespace MagenttaOne.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Puesto> Puestos => Set<Puesto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Puesto>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Area).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Nivel).HasConversion<string>().HasMaxLength(20);
            entity.Property(p => p.Modalidad).HasConversion<string>().HasMaxLength(20);
            entity.Property(p => p.Jornada).HasConversion<string>().HasMaxLength(20);
            entity.Property(p => p.SalarioReferencia).HasColumnType("decimal(18,2)");
            entity.Property(p => p.FechaCreacion).HasDefaultValueSql("datetime('now')");

            // Unique constraint: no duplicate active Nombre within the same Area (case-insensitive)
            entity.HasIndex(p => new { p.Nombre, p.Area })
                  .HasFilter("\"Activo\" = 1")
                  .IsUnique();
        });
    }
}
