using Eternity.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Common.Mapping;

public static class MappingExtensions
{
    public static Task<PaginatedList<TDestination>> PaginatedListAsync<TDestination>(
        this IQueryable<TDestination> queryable, int pageNumber, int pageSize,
        CancellationToken cancellationToken = default) where TDestination : class {
        return PaginatedList<TDestination>.CreateAsync(
            queryable.AsNoTracking(),
            pageNumber,
            pageSize,
            cancellationToken
        );
    }
}
