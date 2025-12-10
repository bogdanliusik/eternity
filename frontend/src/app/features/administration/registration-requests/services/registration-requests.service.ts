import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { RegistrationRequest, RegistrationRequestStatus } from '../models/registration-request.model';

export interface AllRequestsCounts {
  pending: number;
  approved: number;
  rejected: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationRequestsService {
  // Mock data for development
  private mockRequests: RegistrationRequest[] = [
    {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      requestedAt: new Date('2024-12-08T10:30:00'),
      status: 'pending'
    },
    {
      id: '2',
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      requestedAt: new Date('2024-12-07T14:15:00'),
      status: 'pending'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      username: 'bobwilson',
      email: 'bob.wilson@example.com',
      requestedAt: new Date('2024-12-06T09:45:00'),
      status: 'pending'
    },
    {
      id: '4',
      name: 'Alice Brown',
      username: 'alicebrown',
      email: 'alice.brown@example.com',
      requestedAt: new Date('2024-12-05T16:20:00'),
      status: 'approved',
      processedAt: new Date('2024-12-06T10:00:00')
    },
    {
      id: '5',
      name: 'Charlie Davis',
      username: 'charlied',
      email: 'charlie.davis@example.com',
      requestedAt: new Date('2024-12-04T11:00:00'),
      status: 'rejected',
      processedAt: new Date('2024-12-05T09:30:00')
    },
    {
      id: '6',
      name: 'Diana Miller',
      username: 'dianam',
      email: 'diana.miller@example.com',
      requestedAt: new Date('2024-12-03T15:45:00'),
      status: 'approved',
      processedAt: new Date('2024-12-04T08:15:00')
    },
    {
      id: '7',
      name: 'Edward Johnson',
      username: 'edwardj',
      email: 'edward.johnson@example.com',
      requestedAt: new Date('2024-12-02T12:30:00'),
      status: 'rejected',
      processedAt: new Date('2024-12-03T14:00:00')
    }
  ];

  /**
   * Get counts for all request statuses in a single call.
   * This is more efficient than making 3 separate API calls.
   */
  getAllCounts(): Observable<AllRequestsCounts> {
    // TODO: Replace with actual API call
    // return this.http.get<AllRequestsCounts>(`${this.baseUrl}/counts`);
    return of({
      pending: this.mockRequests.filter((r) => r.status === 'pending').length,
      approved: this.mockRequests.filter((r) => r.status === 'approved').length,
      rejected: this.mockRequests.filter((r) => r.status === 'rejected').length
    }).pipe(delay(200));
  }

  getRequests(status: RegistrationRequestStatus): Observable<RegistrationRequest[]> {
    // TODO: Replace with actual API call
    // return this.http.get<RegistrationRequest[]>(`${this.baseUrl}/requests`, { params: { status } });
    const requests = this.mockRequests.filter((r) => r.status === status);
    return of([...requests]).pipe(delay(500));
  }

  approveRequest(id: string): Observable<RegistrationRequest> {
    // TODO: Replace with actual API call
    // return this.http.post<RegistrationRequest>(`${this.baseUrl}/requests/${id}/approve`);
    const request = this.mockRequests.find((r) => r.id === id);
    if (request) {
      request.status = 'approved';
      request.processedAt = new Date();
    }
    return of({ ...request! }).pipe(delay(300));
  }

  rejectRequest(id: string): Observable<RegistrationRequest> {
    // TODO: Replace with actual API call
    // return this.http.post<RegistrationRequest>(`${this.baseUrl}/requests/${id}/reject`);
    const request = this.mockRequests.find((r) => r.id === id);
    if (request) {
      request.status = 'rejected';
      request.processedAt = new Date();
    }
    return of({ ...request! }).pipe(delay(300));
  }
}
