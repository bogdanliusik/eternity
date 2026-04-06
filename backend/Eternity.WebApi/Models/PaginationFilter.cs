namespace Eternity.WebApi.Models;

public class PaginationFilter
{
    private const int DefaultPageNumber = 1;
    private const int DefaultPageSize = 10;
    public int? PageNumber { get; init; }
    public int? PageSize { get; init; }

    public int GetPageNumber() {
        return PageNumber ?? DefaultPageNumber;
    }

    public int GetPageSize() {
        return PageSize ?? DefaultPageSize;
    }
}
