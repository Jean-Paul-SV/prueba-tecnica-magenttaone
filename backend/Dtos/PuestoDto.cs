using System.Text.Json.Serialization;
using MagenttaOne.Api.Models;

namespace MagenttaOne.Api.Dtos;

public class PuestoDto
{
    public int Id { get; set; }
    public string Area { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public NivelPuesto Nivel { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Modalidad Modalidad { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Jornada Jornada { get; set; }

    public decimal? SalarioReferencia { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class CreatePuestoDto
{
    public string Area { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public NivelPuesto Nivel { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Modalidad Modalidad { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Jornada Jornada { get; set; }

    public decimal? SalarioReferencia { get; set; }
}

public class UpdatePuestoDto
{
    public string Area { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public NivelPuesto Nivel { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Modalidad Modalidad { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Jornada Jornada { get; set; }

    public decimal? SalarioReferencia { get; set; }
}
