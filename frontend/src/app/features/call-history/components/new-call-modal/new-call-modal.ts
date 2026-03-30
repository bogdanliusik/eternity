import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LucideAngularModule, Video } from 'lucide-angular';
import { Multiselect } from '@/shared/components/multiselect/multiselect';
import { CallHistoryService } from '../../services/call-history.service';
import { CallHistoryStore } from '../../store/call-history.store';

interface ParticipantOption {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
}

@Component({
  selector: 'app-new-call-modal',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, LucideAngularModule, Multiselect],
  templateUrl: './new-call-modal.html'
})
export class NewCallModal implements OnInit {
  readonly store = inject(CallHistoryStore);
  private readonly callService = inject(CallHistoryService);

  readonly videoIcon = Video;

  readonly participants = signal<ParticipantOption[]>([]);

  get modalVisible(): boolean {
    return this.store.newCallModalVisible();
  }

  set modalVisible(value: boolean) {
    if (!value) {
      this.store.closeNewCallModal();
    }
  }

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    participants: new FormControl<ParticipantOption[]>([], { nonNullable: true, validators: [Validators.required] })
  });

  ngOnInit(): void {
    this.loadParticipants('');
  }

  loadParticipants(search: string): void {
    this.callService.getAvailableParticipants(search).subscribe((users) => {
      this.participants.set(
        users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          username: u.username,
          avatarUrl: u.avatarUrl,
          isOnline: u.isOnline
        }))
      );
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { name, participants } = this.form.getRawValue();
    this.store.createCall({
      name,
      participantIds: participants.map((p) => p.id)
    });
  }

  onClose(): void {
    this.form.reset();
    this.store.closeNewCallModal();
  }
}
