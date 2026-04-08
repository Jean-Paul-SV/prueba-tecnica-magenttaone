using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MagenttaOne.Api.Data;
using MagenttaOne.Api.Dtos;
using MagenttaOne.Api.Models;

namespace MagenttaOne.Tests;

public class PuestosApiTests : IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";
    private readonly JsonSerializerOptions _json = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public PuestosApiTests()
    {
        _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase(_dbName));
            });
        });
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private CreatePuestoDto ValidPuesto(string nombre = "Analista QA") => new()
    {
        Area = "Desarrollo de Sistemas",
        Nombre = nombre,
        Nivel = NivelPuesto.Sr,
        Modalidad = Modalidad.Remoto,
        Jornada = Jornada.TiempoCompleto,
        SalarioReferencia = 18000m
    };

    // --- GET ---

    [Fact]
    public async Task GET_Puestos_ReturnsSeedData()
    {
        var response = await _client.GetAsync("/api/puestos?activo=true");
        response.EnsureSuccessStatusCode();

        var puestos = await response.Content.ReadFromJsonAsync<List<PuestoDto>>(_json);
        Assert.NotNull(puestos);
        Assert.True(puestos.Count >= 4, $"Seed should create at least 4 active puestos, got {puestos.Count}");
    }

    [Fact]
    public async Task GET_NonExistentId_Returns404()
    {
        var response = await _client.GetAsync("/api/puestos/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GET_FilterByNombre_ReturnsFiltered()
    {
        // Create a uniquely named puesto
        await _client.PostAsJsonAsync("/api/puestos", ValidPuesto("ZzzUnico123"), _json);

        var response = await _client.GetAsync("/api/puestos?nombre=ZzzUnico123");
        var puestos = await response.Content.ReadFromJsonAsync<List<PuestoDto>>(_json);

        Assert.NotNull(puestos);
        Assert.Single(puestos);
        Assert.Contains("ZzzUnico123", puestos[0].Nombre);
    }

    [Fact]
    public async Task GET_FilterByActivo_ExcludesInactive()
    {
        var response = await _client.GetAsync("/api/puestos?activo=true");
        var puestos = await response.Content.ReadFromJsonAsync<List<PuestoDto>>(_json);

        Assert.NotNull(puestos);
        Assert.All(puestos, p => Assert.True(p.Activo));
    }

    // --- POST ---

    [Fact]
    public async Task POST_CreatePuesto_Returns201()
    {
        var dto = ValidPuesto("Nuevo Puesto Test");
        var response = await _client.PostAsJsonAsync("/api/puestos", dto, _json);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<PuestoDto>(_json);
        Assert.NotNull(created);
        Assert.Equal(dto.Nombre, created.Nombre);
        Assert.Equal(dto.Modalidad, created.Modalidad);
        Assert.Equal(dto.Jornada, created.Jornada);
        Assert.True(created.Activo);
        Assert.True(created.Id > 0);
    }

    [Fact]
    public async Task POST_EmptyNombre_ReturnsValidationError()
    {
        var dto = ValidPuesto();
        dto.Nombre = "";

        var response = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task POST_NegativeSalario_ReturnsValidationError()
    {
        var dto = ValidPuesto("Salario Negativo Test");
        dto.SalarioReferencia = -5000;

        var response = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task POST_DuplicateName_Returns409()
    {
        var dto = ValidPuesto("Puesto Duplicado Test");

        var first = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task POST_ModalidadJornada_IndependentCombination()
    {
        var dto = ValidPuesto("Remoto MedioTiempo Test");
        dto.Modalidad = Modalidad.Remoto;
        dto.Jornada = Jornada.MedioTiempo;

        var response = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<PuestoDto>(_json);
        Assert.Equal(Modalidad.Remoto, created!.Modalidad);
        Assert.Equal(Jornada.MedioTiempo, created.Jornada);
    }

    // --- PUT ---

    [Fact]
    public async Task PUT_UpdatePuesto_Returns200()
    {
        var dto = ValidPuesto("Puesto Para Editar Test");
        var createRes = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        var created = await createRes.Content.ReadFromJsonAsync<PuestoDto>(_json);

        var update = new UpdatePuestoDto
        {
            Area = created!.Area,
            Nombre = "Puesto Editado Test",
            Nivel = NivelPuesto.Lider,
            Modalidad = Modalidad.Hibrido,
            Jornada = Jornada.MedioTiempo,
            SalarioReferencia = 25000m
        };

        var response = await _client.PutAsJsonAsync($"/api/puestos/{created.Id}", update, _json);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content.ReadFromJsonAsync<PuestoDto>(_json);
        Assert.Equal("Puesto Editado Test", updated!.Nombre);
        Assert.Equal(Modalidad.Hibrido, updated.Modalidad);
        Assert.Equal(Jornada.MedioTiempo, updated.Jornada);
    }

    // --- DELETE ---

    [Fact]
    public async Task DELETE_SoftDelete_SetsInactive()
    {
        var dto = ValidPuesto("Puesto Para Eliminar Test");
        var createRes = await _client.PostAsJsonAsync("/api/puestos", dto, _json);
        var created = await createRes.Content.ReadFromJsonAsync<PuestoDto>(_json);

        var delRes = await _client.DeleteAsync($"/api/puestos/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delRes.StatusCode);

        var getRes = await _client.GetAsync($"/api/puestos/{created.Id}");
        var puesto = await getRes.Content.ReadFromJsonAsync<PuestoDto>(_json);
        Assert.False(puesto!.Activo);
    }

    // --- SEED / LEGACY ---

    [Fact]
    public async Task Seed_LegacyMigration_PresencialMedioTiempo()
    {
        // The seed creates "Mantenimiento y Limpieza" with Presencial + MedioTiempo
        // simulating legacy migration from old "MedioTiempo" modalidad
        var response = await _client.GetAsync("/api/puestos?nombre=Mantenimiento");
        var puestos = await response.Content.ReadFromJsonAsync<List<PuestoDto>>(_json);

        Assert.NotNull(puestos);
        var legacy = puestos.FirstOrDefault(p => p.Nombre.Contains("Mantenimiento"));
        Assert.NotNull(legacy);
        Assert.Equal(Modalidad.Presencial, legacy.Modalidad);
        Assert.Equal(Jornada.MedioTiempo, legacy.Jornada);
    }

    [Fact]
    public async Task Seed_RequiredCombinations_Exist()
    {
        var response = await _client.GetAsync("/api/puestos");
        var puestos = await response.Content.ReadFromJsonAsync<List<PuestoDto>>(_json);

        // Presencial + MedioTiempo
        Assert.Contains(puestos!, p => p.Modalidad == Modalidad.Presencial && p.Jornada == Jornada.MedioTiempo);
        // Remoto + TiempoCompleto
        Assert.Contains(puestos!, p => p.Modalidad == Modalidad.Remoto && p.Jornada == Jornada.TiempoCompleto);
        // Hibrido + TiempoCompleto
        Assert.Contains(puestos!, p => p.Modalidad == Modalidad.Hibrido && p.Jornada == Jornada.TiempoCompleto);
    }
}
