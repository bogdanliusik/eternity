export type RegistrationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationRequest {
  id: string;
  name: string;
  username: string;
  email: string;
  requestedAt: Date;
  status: RegistrationRequestStatus;
  processedAt?: Date;
}
