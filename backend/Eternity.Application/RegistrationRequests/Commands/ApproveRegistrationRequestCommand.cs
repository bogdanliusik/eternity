using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Application.RegistrationRequests.Models;
using Eternity.Domain.Constants;
using Eternity.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.RegistrationRequests.Commands;

[Authorize(Policy = Policies.AdminOnly)]
public record ApproveRegistrationRequestCommand(Guid Id) : IRequest<Result<RegistrationRequestDto>>;

public class ApproveRegistrationRequestCommandHandler(IAppDbContext dbContext, IIdentityService identityService)
    : IRequestHandler<ApproveRegistrationRequestCommand, Result<RegistrationRequestDto>>
{
    public async Task<Result<RegistrationRequestDto>> Handle(ApproveRegistrationRequestCommand request, 
        CancellationToken cancellationToken) {
        var registrationRequest = await dbContext.RegistrationRequests
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (registrationRequest == null) {
            return Result<RegistrationRequestDto>.Failure(["Registration request not found."]);
        }
        if (!registrationRequest.CanApprove) {
            return Result<RegistrationRequestDto>.Failure(["Only pending requests can be approved."]);
        }
        var userIdResult = await identityService.FindUserIdByNameAsync(registrationRequest.UserName);
        if (!userIdResult.Succeeded) {
            return Result<RegistrationRequestDto>.Failure(userIdResult.Errors);
        }
        var userId = userIdResult.Data;
        var activateResult = await identityService.SetUserLockoutEndAsync(userId, null);
        if (!activateResult.Succeeded) {
            return Result<RegistrationRequestDto>.Failure(activateResult.Errors);
        }
        var addRoleResult = await identityService.AddUserToRoleAsync(userId, RoleNames.Member);
        if (!addRoleResult.Succeeded) {
            return Result<RegistrationRequestDto>.Failure(addRoleResult.Errors);
        }
        await dbContext.UserAccounts.AddAsync(new UserAccount {
            Id = userId,
            UserName = registrationRequest.UserName,
            Email = registrationRequest.Email
        }, cancellationToken);
        registrationRequest.Approve();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<RegistrationRequestDto>.Success(RegistrationRequestDto.FromEntity(registrationRequest));
    }
}

public class ApproveRegistrationRequestCommandValidator : AbstractValidator<ApproveRegistrationRequestCommand>
{
    public ApproveRegistrationRequestCommandValidator() {
        RuleFor(x => x.Id).NotEmpty();
    }
}
