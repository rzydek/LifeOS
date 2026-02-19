// apps/shell/src/app/pages/personas/personas.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Persona {
  id: string;
  name: string;
  description: string;
  instruction: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private apiUrl = '/api/personas';
  private http = inject(HttpClient);

  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.apiUrl);
  }

  getPersona(id: string): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/${id}`);
  }

  createPersona(persona: Partial<Persona>): Observable<Persona> {
    return this.http.post<Persona>(this.apiUrl, persona);
  }

  updatePersona(id: string, persona: Partial<Persona>): Observable<Persona> {
    return this.http.patch<Persona>(`${this.apiUrl}/${id}`, persona);
  }

  deletePersona(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
