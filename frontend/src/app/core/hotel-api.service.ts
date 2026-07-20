import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { DashboardStats, Reservation, ReservationStatus, Room, RoomType, Review } from './models';
import { environment } from '../../environment/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class HotelApiService {
  private readonly http = inject(HttpClient);

  getRoomTypes() {
    return this.http.get<RoomType[]>(`${API_URL}/rooms/types`);
  }

  getRooms(filters: Record<string, string | number | null | undefined> = {}) {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<Room[]>(`${API_URL}/rooms`, { params });
  }

  createRoom(payload: {
    roomNumber: string;
    floor: number;
    sizeSqm?: number;
    roomTypeId: number;
    imageUrl?: string;
  }) {
    return this.http.post<Room>(`${API_URL}/rooms`, payload);
  }

  createReservation(payload: {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    guest: number;
    specialRequest?: string;
  }) {
    return this.http.post<Reservation>(`${API_URL}/reservations`, payload);
  }

  getReservations() {
    return this.http.get<Reservation[]>(`${API_URL}/reservations`);
  }

  updateReservationStatus(id: number, status: ReservationStatus) {
    return this.http.patch<Reservation>(`${API_URL}/reservations/${id}/status`, {
      status,
    });
  }

  cancelReservation(id: number) {
    return this.http.patch<Reservation>(`${API_URL}/reservations/${id}/cancel`, {});
  }

  getDashboardStats() {
    return this.http.get<{ stats: DashboardStats }>(`${API_URL}/dashboard/admin`);
  }

  getReviews() {
    return this.http.get<Review[]>(`${API_URL}/reviews`);
  }

  createReview(payload: { roomId: number; rating: number; comment?: string }) {
    return this.http.post<Review>(`${API_URL}/reviews`, payload);
  }
}
