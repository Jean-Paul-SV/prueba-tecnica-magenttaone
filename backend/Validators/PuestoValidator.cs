using FluentValidation;
using MagenttaOne.Api.Dtos;

namespace MagenttaOne.Api.Validators;

public class CreatePuestoValidator : AbstractValidator<CreatePuestoDto>
{
    public CreatePuestoValidator()
    {
        RuleFor(x => x.Area).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nivel).IsInEnum();
        RuleFor(x => x.Modalidad).IsInEnum();
        RuleFor(x => x.Jornada).IsInEnum();
        RuleFor(x => x.SalarioReferencia)
            .GreaterThanOrEqualTo(0)
            .When(x => x.SalarioReferencia.HasValue);
    }
}

public class UpdatePuestoValidator : AbstractValidator<UpdatePuestoDto>
{
    public UpdatePuestoValidator()
    {
        RuleFor(x => x.Area).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nivel).IsInEnum();
        RuleFor(x => x.Modalidad).IsInEnum();
        RuleFor(x => x.Jornada).IsInEnum();
        RuleFor(x => x.SalarioReferencia)
            .GreaterThanOrEqualTo(0)
            .When(x => x.SalarioReferencia.HasValue);
    }
}
