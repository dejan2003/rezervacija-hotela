import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service';
import { HotelApiService } from '../../core/hotel-api.service';
import { Room, RoomType, Review } from '../../core/models';

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(HotelApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly rooms = signal<Room[]>([]);
  readonly roomTypes = signal<RoomType[]>([]);
  readonly loading = signal(false);

  readonly reviews = signal<Review[]>([]);
  readonly ratingStars = [1, 2, 3, 4, 5];

  readonly tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();

  readonly dayAfterTomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  })();

  readonly searchForm = this.fb.nonNullable.group({
    checkIn: [this.tomorrow, Validators.required],
    checkOut: [this.dayAfterTomorrow, Validators.required],
    guests: [1, [Validators.required, Validators.min(1)]],
    roomTypeId: [''],
    amenities: this.fb.nonNullable.control<string[]>([]),
  });

  readonly amenityOptions = ['WiFi', 'TV', 'Klima', 'Mini bar', 'Balkon', 'Jacuzzi'];

  ngOnInit(): void {
    this.loadRooms();

    this.api.getRoomTypes().subscribe({
      next: (roomTypes) => this.roomTypes.set(roomTypes),
      error: () => this.roomTypes.set([]),
    });

    this.api.getReviews().subscribe({
      next: (reviews) => this.reviews.set(reviews),
      error: () => this.reviews.set([]),
    });
  }

  loadRooms(): void {
    this.loading.set(true);

    const { checkIn, checkOut, guests, roomTypeId, amenities } = this.searchForm.getRawValue();

    this.api
      .getRooms({
        checkIn: toDateInput(checkIn),
        checkOut: toDateInput(checkOut),
        guests,
        roomTypeId,
        amenities: amenities.join(','),
      })
      .subscribe({
        next: (rooms) => {
          this.rooms.set(rooms);
          this.loading.set(false);
        },
        error: () => {
          this.snackBar.open('Rooms could not be loaded.', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
  }

  reserve(room: Room): void {
    if (!this.auth.currentUser()) {
      this.snackBar.open('Please login before reservation.', 'Login', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { checkIn, checkOut, guests } = this.searchForm.getRawValue();

    this.api
      .createReservation({
        roomId: room.roomId,
        checkInDate: toDateInput(checkIn),
        checkOutDate: toDateInput(checkOut),
        guest: guests,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Reservation created!', 'Go to dashboard', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Reservation failed.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  amenities(room: Room): string[] {
    return (
      room.roomType?.amenities
        ?.split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 8) || []
    );
  }

  price(room: Room): number {
    return Number(room.roomType?.basePrice);
  }

  averageRating(room: Room): number | null {
    const roomReviews = this.reviews().filter((review) => review.room.roomId === room.roomId);

    if (!roomReviews.length) {
      return null;
    }

    const total = roomReviews.reduce((sum, review) => sum + Number(review.rating), 0);

    return Math.round((total / roomReviews.length) * 10) / 10;
  }

  reviewCount(room: Room): number {
    return this.reviews().filter((review) => review.room.roomId === room.roomId).length;
  }
}
