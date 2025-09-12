namespace Eternity.Application.Common.Interfaces;

public interface ICurrentUser
{
    Guid Id { get; }
    bool IsAvailable { get; }
    string Name { get; }
    List<string>? Roles { get; }
}
