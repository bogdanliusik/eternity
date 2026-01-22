using Eternity.Application.Common.Interfaces;
using FluentValidation;

namespace Eternity.Application.Common.Behaviours;

/// <summary>
/// Generic validator for all queries implementing <see cref="IPaginatedQuery"/>.
/// This validator is automatically applied to any request that implements IPaginatedQuery
/// </summary>
public class PaginatedQueryValidator<T> : AbstractValidator<T> where T : IPaginatedQuery
{
    private const int MaxPageSize = 100;
    public PaginatedQueryValidator() {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageNumber must be at least 1.");
        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageSize must be at least 1.")
            .LessThanOrEqualTo(MaxPageSize)
            .WithMessage($"PageSize must not exceed {MaxPageSize}.");
    }
}
