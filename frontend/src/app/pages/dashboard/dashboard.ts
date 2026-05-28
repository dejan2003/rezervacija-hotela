import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { AuthService } from '../../core/auth.service';
import { HotelApiService } from '../../core/hotel-api.service';
import {
  DashboardStats,
  Reservation,
  ReservationStatus,
  Room,
  RoomType
} from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  protected readonly auth = inject(AuthService);
  private readonly api = inject(HotelApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly stats = signal<DashboardStats | null>(null);
  readonly reservations = signal<Reservation[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly roomTypes = signal<RoomType[]>([]);
  readonly loading = signal(false);

  readonly reservationColumns = ['code', 'guest', 'room', 'dates', 'total', 'status', 'actions'];
  readonly guestReservationColumns = ['code', 'room', 'dates', 'total', 'status', 'actions'];

  readonly statuses: ReservationStatus[] = [
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'CHECKED_IN',
    'CHECKED_OUT'
  ];

  readonly roomForm = this.fb.nonNullable.group({
    roomNumber: ['', Validators.required],
    floor: [1, Validators.required],
    sizeSqm: [28],
    roomTypeId: [0, Validators.required],
    imageUrl: [''],
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.api.getReservations().subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Reservations could not be loaded.', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });

    this.api.getRoomTypes().subscribe({
      next: (roomTypes) => this.roomTypes.set(roomTypes),
      error: () => this.roomTypes.set([]),
    });

    this.api.getRooms({ status: 'AVAILABLE' }).subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
      },
      error: () => {
        this.snackBar.open('Rooms could not be loaded.', 'Close', { duration: 3000 });
      },
    });

    if (this.auth.isAdmin()) {
      this.api.getDashboardStats().subscribe({
        next: (res) => this.stats.set(res.stats),
      });
    }
  }

  createRoom(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.api.createRoom(this.roomForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Room created successfully.', 'Close', { duration: 3000 });
        this.roomForm.reset({
          roomNumber: '',
          floor: 1,
          sizeSqm: 28,
          roomTypeId: 0,
          imageUrl: ''
        });
        this.loadDashboard();
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Room could not be created.',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  updateStatus(reservation: Reservation, event: MatSelectChange): void {
    this.api.updateReservationStatus(reservation.reservationId, event.value).subscribe({
      next: () => {
        this.snackBar.open('Reservation status updated.', 'Close', { duration: 2500 });
        this.loadDashboard();
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Status could not be updated.',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  cancelReservation(reservation: Reservation): void {
    this.api.cancelReservation(reservation.reservationId).subscribe({
      next: () => {
        this.snackBar.open('Reservation cancelled.', 'Close', { duration: 2500 });
        this.loadDashboard();
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Reservation could not be cancelled.',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  statusClass(status: ReservationStatus): string {
    if (status === 'CANCELLED') return 'danger';
    if (status === 'PENDING') return 'warning';
    return '';
  }

  price(value: string | number): number {
    return Number(value);
  }
}