import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchConfig, Category, Location, ScrapedOffer } from './parts-sniper.model';

@Injectable({
  providedIn: 'root'
})
export class PartsSniperService {
  private apiUrl = '/api/search';
  private http = inject(HttpClient);

  getConfigs(): Observable<SearchConfig[]> {
    return this.http.get<SearchConfig[]>(`${this.apiUrl}/config`);
  }

  createConfig(config: Partial<SearchConfig>): Observable<SearchConfig> {
    return this.http.post<SearchConfig>(`${this.apiUrl}/config`, config);
  }

  updateConfig(id: string, config: Partial<SearchConfig>): Observable<SearchConfig> {
    return this.http.put<SearchConfig>(`${this.apiUrl}/config/${id}`, config);
  }
  
  deleteConfig(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/config/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`);
  }

  addLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/locations`, location);
  }

  getOffers(searchConfigId?: string, minScore = 0): Observable<ScrapedOffer[]> {
    let params = new HttpParams();
    if (searchConfigId) {
      params = params.set('searchConfigId', searchConfigId);
    }
    if (minScore > 0) {
      params = params.set('minScore', minScore.toString());
    }
    
    return this.http.get<ScrapedOffer[]>(`${this.apiUrl}/offers`, { params });
  }
}
