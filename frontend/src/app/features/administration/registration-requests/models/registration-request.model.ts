export enum RegistrationRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export interface RegistrationRequest {
  id: string;
  name: string;
  username: string;
  email: string;
  requestedAt: Date;
  status: RegistrationRequestStatus;
  processedAt?: Date;
}
