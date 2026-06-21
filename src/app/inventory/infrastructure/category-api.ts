import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CategoryResource {
  id: number; // API returns number
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryApi {
  // Use backend API URL if available, otherwise fallback to platform provider API
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCategoriesEndpointPath}`;
  }

  getAll(): Observable<CategoryResource[]> {
    return this.http.get<CategoryResource[]>(this.baseUrl).pipe(
      map(categories => categories.map(cat => ({
        ...cat,
        id: cat.id // Keep as number, will be converted to string in store
      })))
    );
  }

  createCategory(name: string, description: string = ''): Observable<CategoryResource> {
    return this.http.post<CategoryResource>(this.baseUrl, {
      name,
      description
    });
  }
}
