import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:4000/api';

  login(data: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  getTest() {
    return this.http.get(`${this.baseUrl}/test`);
  }
}