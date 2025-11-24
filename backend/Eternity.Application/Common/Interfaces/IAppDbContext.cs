using Eternity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<UserAccount> UserAccounts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
