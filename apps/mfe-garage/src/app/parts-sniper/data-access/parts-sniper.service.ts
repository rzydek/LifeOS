import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchConfig, Category, Location, ScrapedOffer } from './parts-sniper.model';

@Injectable({
  providedIn: 'root'
})
export class PartsSniperService {
  private apiUrl = '/api/search';

  constructor(private http: HttpClient) {}

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

  getOffers(searchConfigId?: string, onlyGreatDeals = false): Observable<ScrapedOffer[]> {
    let params: any = {};
    if (searchConfigId) params.searchConfigId = searchConfigId;
    if (onlyGreatDeals) params.onlyGreatDeals = 'true';
    
    return this.http.get<ScrapedOffer[]>(`${this.apiUrl}/offers`, { params });
  }
}
