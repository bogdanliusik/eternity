using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.RegistrationRequests.Models;
using Eternity.Domain.Constants;
using Eternity.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.RegistrationRequests.Commands;

public record SubmitRegistrationRequestCommand(string Name, string UserName, string Email, string Password)
    : IRequest<Result<RegistrationRequestDto>>;

public class SubmitRegistrationRequestCommandHandler(IAppDbContext dbContext, IIdentityService identityService)
    : IRequestHandler<SubmitRegistrationRequestCommand, Result<RegistrationRequestDto>>
{
    public async Task<Result<RegistrationRequestDto>> Handle(SubmitRegistrationRequestCommand request,
        CancellationToken cancellationToken) {
        var normalizedUserName = request.UserName.Trim();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await dbContext.UserAccounts.AnyAsync(
            u => u.UserName == normalizedUserName || u.Email == normalizedEmail,
            cancellationToken
        );
        if (existingUser) {
            return Result<RegistrationRequestDto>.Failure(
                [
                    "User with the same username or email already exists."
                ]
            );
        }
        var existingPendingRequest = await dbContext.RegistrationRequests.AnyAsync(
            r => (r.UserName == normalizedUserName || r.Email == normalizedEmail) &&
                 r.Status == RegistrationRequestStatus.Pending,
            cancellationToken
        );
        if (existingPendingRequest) {
            return Result<RegistrationRequestDto>.Failure(
                [
                    "A pending registration request already exists for this user."
                ]
            );
        }
        var createUserResult = await identityService.CreateUserAsync(
            normalizedUserName,
            normalizedEmail,
            request.Password
        );
        if (!createUserResult.Succeeded) {
            return Result<RegistrationRequestDto>.Failure(createUserResult.Errors);
        }
        var userId = createUserResult.Data;
        var lockoutResult = await identityService.SetUserLockoutEndAsync(userId, DateTimeOffset.MaxValue);
        if (!lockoutResult.Succeeded) {
            return Result<RegistrationRequestDto>.Failure(lockoutResult.Errors);
        }
        var requestEntity = RegistrationRequest.Create(request.Name, normalizedUserName, normalizedEmail);
        await dbContext.RegistrationRequests.AddAsync(requestEntity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<RegistrationRequestDto>.Success(RegistrationRequestDto.FromEntity(requestEntity));
    }
}

public class SubmitRegistrationRequestCommandValidator : AbstractValidator<SubmitRegistrationRequestCommand>
{
    public SubmitRegistrationRequestCommandValidator() {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}
