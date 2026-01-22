namespace Eternity.Application.Common.Interfaces;

public interface IPaginatedQuery
{
    int PageNumber { get; }
    int PageSize { get; }
}
