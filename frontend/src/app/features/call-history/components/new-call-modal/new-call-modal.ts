import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Phone,Video } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { Multiselect } from '@/shared/components/multiselect/multiselect';

import { CallType,UserSummary } from '../../models/call-history.model';
import { CallHistoryService } from '../../services/call-history.service';
import { CallHistoryStore } from '../../store/call-history.store';

@Component({
  selector: 'app-new-call-modal',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, LucideAngularModule, Multiselect],
  templateUrl: './new-call-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCallModal implements OnInit {
  readonly store = inject(CallHistoryStore);
  private readonly callService = inject(CallHistoryService);

  readonly videoIcon = Video;
  readonly phoneIcon = Phone;

  readonly CallType = CallType;

  readonly participants = signal<UserSummary[]>([]);
  readonly selectedCallType = signal<CallType>(CallType.Video);

  get modalVisible(): boolean {
    return this.store.newCallModalVisible();
  }

  set modalVisible(value: boolean) {
    if (!value) {
      this.store.closeNewCallModal();
    }
  }

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    participants: new FormControl<UserSummary[]>([], { nonNullable: true, validators: [Validators.required] })
  });

  ngOnInit(): void {
    this.loadParticipants('');
  }

  loadParticipants(search: string): void {
    this.callService.searchUsers(search).subscribe((users) => {
      this.participants.set(users);
    });
  }

  setCallType(type: CallType): void {
    this.selectedCallType.set(type);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { name, participants } = this.form.getRawValue();
    this.store.createCall({
      inviteeIds: participants.map((p) => p.id),
      type: this.selectedCallType(),
      name: name || undefined
    });
  }

  onClose(): void {
    this.form.reset();
    this.selectedCallType.set(CallType.Video);
    this.store.closeNewCallModal();
  }
}
