namespace Eternity.Application.Common.Models;

public interface IResult<out TSelf> where TSelf : IResult<TSelf>
{
    bool Succeeded { get; }
    IReadOnlyList<string> Errors { get; }
    static abstract TSelf Failure(IEnumerable<string> errors);
}

public class Result : IResult<Result>
{
    protected Result(bool succeeded, IReadOnlyList<string> errors) {
        Succeeded = succeeded;
        Errors = errors;
    }

    public bool Succeeded { get; }

    public IReadOnlyList<string> Errors { get; }

    public bool IsFailure => !Succeeded;

    public static Result Success() => new(true, Array.Empty<string>());

    public static Result Failure(IEnumerable<string> errors) => new(false, errors.ToArray());
}

public class Result<T> : Result, IResult<Result<T>>
{
    private Result(bool succeeded, T data, IReadOnlyList<string> errors) : base(succeeded, errors) {
        Data = data;
    }

    public T Data { get; }

    public static Result<T> Success(T data) => new(true, data, Array.Empty<string>());

    public new static Result<T> Failure(IEnumerable<string> errors) => new(false, default!, errors.ToArray());
}
