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

    public bool IsFailure => !Succeeded;
    public bool Succeeded { get; }
    public IReadOnlyList<string> Errors { get; }

    public static Result Failure(IEnumerable<string> errors) {
        return new Result(false, errors.ToArray());
    }

    public static Result Success() {
        return new Result(true, Array.Empty<string>());
    }
}

public class Result<T> : Result, IResult<Result<T>>
{
    private Result(bool succeeded, T data, IReadOnlyList<string> errors) : base(succeeded, errors) {
        Data = data;
    }

    public T Data { get; }

    public new static Result<T> Failure(IEnumerable<string> errors) {
        return new Result<T>(false, default!, errors.ToArray());
    }

    public static Result<T> Success(T data) {
        return new Result<T>(true, data, Array.Empty<string>());
    }
}
