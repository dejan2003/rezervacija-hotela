import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { User } from './models';

const API_URL = 'http://localhost:4000/api';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAdmin = computed(() =>
    ['ADMIN', 'RECEPTIONIST'].includes(this.userSignal()?.role || ''),
  );

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, credentials)
      .pipe(tap((response) => this.storeSession(response)));
  }

  register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  updateProfile(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.http
      .patch<AuthResponse>(`${API_URL}/auth/me`, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  refreshProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${API_URL}/auth/me`).pipe(
      tap(({ user }) => {
        localStorage.setItem('hotel_user', JSON.stringify(user));
        this.userSignal.set(user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_user');
    this.userSignal.set(null);
    this.router.navigate(['/']);
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem('hotel_token', response.token);
    localStorage.setItem('hotel_user', JSON.stringify(response.user));
    this.userSignal.set(response.user);
  }

  private readStoredUser(): User | null {
    const rawUser = localStorage.getItem('hotel_user');

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem('hotel_user');
      localStorage.removeItem('hotel_token');
      return null;
    }
  }
}
