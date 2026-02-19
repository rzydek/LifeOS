import { Injectable } from '@angular/core';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly tokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.access_token);
    localStorage.setItem(this.refreshTokenKey, authResult.refresh_token);
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
