using Eternity.Application.Common.Interfaces;
using Eternity.Application.Common.Models;
using Eternity.Application.Common.Security;
using Eternity.Application.RegistrationRequests.Models;
using Eternity.Domain.Constants;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Eternity.Application.RegistrationRequests.Commands;

[Authorize(Policy = Policies.AdminOnly)]
public record RejectRegistrationRequestCommand(Guid Id) : IRequest<Result<RegistrationRequestDto>>;

public class RejectRegistrationRequestCommandHandler(IAppDbContext dbContext, IIdentityService identityService)
    : IRequestHandler<RejectRegistrationRequestCommand, Result<RegistrationRequestDto>>
{
    public async Task<Result<RegistrationRequestDto>> Handle(RejectRegistrationRequestCommand request,
        CancellationToken cancellationToken) {
        var registrationRequest =
            await dbContext.RegistrationRequests.FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        if (registrationRequest == null) {
            return Result<RegistrationRequestDto>.Failure(["Registration request not found."]);
        }
        if (!registrationRequest.CanReject) {
            return Result<RegistrationRequestDto>.Failure(["Only pending requests can be rejected."]);
        }
        var deleteIdentityResult = await identityService.DeleteUserByNameAsync(registrationRequest.UserName);
        if (!deleteIdentityResult.Succeeded) {
            return Result<RegistrationRequestDto>.Failure(deleteIdentityResult.Errors);
        }
        var userAccount = await dbContext.UserAccounts.FirstOrDefaultAsync(
            u => u.UserName == registrationRequest.UserName,
            cancellationToken
        );
        if (userAccount != null) {
            dbContext.UserAccounts.Remove(userAccount);
        }
        registrationRequest.Reject();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<RegistrationRequestDto>.Success(RegistrationRequestDto.FromEntity(registrationRequest));
    }
}

public class RejectRegistrationRequestCommandValidator : AbstractValidator<RejectRegistrationRequestCommand>
{
    public RejectRegistrationRequestCommandValidator() {
        RuleFor(x => x.Id).NotEmpty();
    }
}
