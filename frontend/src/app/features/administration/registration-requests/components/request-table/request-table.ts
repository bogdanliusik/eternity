import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RegistrationRequest, RegistrationRequestStatus } from '../../models/registration-request.model';

@Component({
  selector: 'app-request-table',
  imports: [DatePipe, TableModule, ButtonModule, TooltipModule],
  templateUrl: './request-table.html'
})
export class RequestTable {
  readonly requests = input.required<RegistrationRequest[]>();
  readonly activeTab = input.required<RegistrationRequestStatus>();
  readonly processingIds = input.required<string[]>();

  readonly approve = output<RegistrationRequest>();
  readonly reject = output<RegistrationRequest>();

  isProcessing(id: string): boolean {
    return this.processingIds().includes(id);
  }

  onApprove(request: RegistrationRequest): void {
    this.approve.emit(request);
  }

  onReject(request: RegistrationRequest): void {
    this.reject.emit(request);
  }

  getAvatarClass(): string {
    const tab = this.activeTab();
    if (tab === 'pending') {
      return 'bg-primary/10 text-primary';
    }
    if (tab === 'approved') {
      return 'bg-green-500/10 text-green-600';
    }
    return 'bg-red-500/10 text-red-600';
  }
}
