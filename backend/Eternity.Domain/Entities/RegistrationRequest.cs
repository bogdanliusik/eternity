using Eternity.Domain.Constants;

namespace Eternity.Domain.Entities;

public class RegistrationRequest
{
	private RegistrationRequest() { }

	private RegistrationRequest(string name, string userName, string email) {
		Id = Guid.NewGuid();
		Name = name;
		UserName = userName;
		Email = email;
		Status = RegistrationRequestStatus.Pending;
		RequestedAt = DateTimeOffset.UtcNow;
	}

	public Guid Id { get; private set; }

	public string Name { get; private set; } = null!;

	public string UserName { get; private set; } = null!;

	public string Email { get; private set; } = null!;

	public RegistrationRequestStatus Status { get; private set; } = RegistrationRequestStatus.Pending;

	public DateTimeOffset RequestedAt { get; private set; }

	public DateTimeOffset? ProcessedAt { get; private set; }


	public static RegistrationRequest Create(string name, string userName, string email) {
		ArgumentException.ThrowIfNullOrWhiteSpace(name);
		ArgumentException.ThrowIfNullOrWhiteSpace(userName);
		ArgumentException.ThrowIfNullOrWhiteSpace(email);

		return new RegistrationRequest(name.Trim(), userName.Trim(), email.Trim().ToLowerInvariant());
	}

	public bool CanApprove => Status == RegistrationRequestStatus.Pending;

	public bool CanReject => Status == RegistrationRequestStatus.Pending;

	public void Approve() {
		if (!CanApprove) {
			throw new InvalidOperationException("Only pending requests can be approved.");
		}
		Status = RegistrationRequestStatus.Approved;
		ProcessedAt = DateTimeOffset.UtcNow;
	}

	public void Reject() {
		if (!CanReject) {
			throw new InvalidOperationException("Only pending requests can be rejected.");
		}
		Status = RegistrationRequestStatus.Rejected;
		ProcessedAt = DateTimeOffset.UtcNow;
	}
}
