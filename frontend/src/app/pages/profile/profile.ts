import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = this.auth.currentUser();

  readonly profileForm = this.fb.nonNullable.group({
    firstName: [this.user?.firstName || '', Validators.required],
    lastName: [this.user?.lastName || '', Validators.required],
    email: [this.user?.email || '', [Validators.required, Validators.email]],
    phone: [this.user?.phone || ''],
  });

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.auth.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Podaci su uspešno izmenjeni.', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Podaci nisu izmenjeni.', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
