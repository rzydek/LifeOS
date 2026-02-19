import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
    Observable,
    tap,
    catchError,
    throwError,
    Subscription,
    timer,
} from 'rxjs';
import { TokenService, AuthResponse } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService implements OnDestroy {
    private readonly apiUrl = '/api/auth';
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly tokenService = inject(TokenService);

    private refreshSubscription?: Subscription;

    constructor() {
        this.scheduleRefresh();
    }

    ngOnDestroy(): void {
        this.unscheduleRefresh();
    }

    login(credentials: {
        email: string;
        password: string;
    }): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap((response) => {
                    this.setSession(response);
                    this.router.navigate(['/']);
                }),
            );
    }

    logout(): void {
        this.tokenService.clear();
        this.unscheduleRefresh();
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        const token = this.tokenService.getToken();
        return !!token;
    }

    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.tokenService.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }

        return this.http
            .post<AuthResponse>(`${this.apiUrl}/refresh`, {
                refresh_token: refreshToken,
            })
            .pipe(
                tap((response) => this.setSession(response)),
                catchError((err) => {
                    this.logout();
                    return throwError(() => err);
                }),
            );
    }

    private setSession(authResult: AuthResponse): void {
        this.tokenService.setSession(authResult);

        const expiresIn = authResult.expires_in || 900;
        const refreshTime = (expiresIn - 60) * 1000;

        this.unscheduleRefresh();
        this.refreshSubscription = timer(Math.max(1000, refreshTime)).subscribe(
            () => {
                this.refreshToken().subscribe();
            },
        );
    }

    private scheduleRefresh(): void {
        if (this.tokenService.getRefreshToken()) {
            this.refreshToken().subscribe();
        }
    }

    private unscheduleRefresh(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }
}
