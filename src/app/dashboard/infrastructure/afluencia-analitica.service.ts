import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TraficoDiarioRecord {
  fecha?: string;
  dia?: string;
  diaSemana?: string;
  totalIngresos: number;
}

export interface HoraPicoRecord {
  hora: number;
  cantidadPersonas: number;
}

@Injectable({ providedIn: 'root' })
export class AfluenciaAnaliticaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl;

  getTraficoDiario(fechaInicio: string, fechaFin: string): Observable<TraficoDiarioRecord[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http
      .get<unknown>(`${this.baseUrl}${environment.afluenciaTraficoDiarioEndpointPath}`, { params })
      .pipe(map(response => this.normalizeTraficoDiario(response)));
  }

  getHorasPico(camaraId: number, fecha: string): Observable<HoraPicoRecord[]> {
    const params = new HttpParams()
      .set('camaraId', String(camaraId))
      .set('fecha', fecha);

    return this.http
      .get<unknown>(`${this.baseUrl}${environment.afluenciaHorasPicoEndpointPath}`, { params })
      .pipe(map(response => this.normalizeHorasPico(response)));
  }

  private normalizeTraficoDiario(response: unknown): TraficoDiarioRecord[] {
    const items = this.extractArray(response);
    return items.map(item => ({
      fecha: this.getString(item, ['fecha', 'date']),
      dia: this.getString(item, ['dia', 'day']),
      diaSemana: this.getString(item, ['diaSemana', 'dayOfWeek']),
      totalIngresos: this.getNumber(item, ['totalIngresos', 'ingresos', 'total', 'cantidad'])
    }));
  }

  private normalizeHorasPico(response: unknown): HoraPicoRecord[] {
    const items = this.extractArray(response);
    return items.map(item => ({
      hora: this.getNumber(item, ['hora', 'hour']),
      cantidadPersonas: this.getNumber(item, [
        'cantidadPersonas',
        'personas',
        'totalPersonas',
        'totalIngresos',
        'cantidad',
        'total'
      ])
    }));
  }

  private extractArray(response: unknown): Record<string, unknown>[] {
    if (Array.isArray(response)) return response.filter(this.isRecord);

    if (this.isRecord(response)) {
      const candidates = [
        response['content'],
        response['data'],
        response['items'],
        response['records'],
        response['reporte'],
        response['resultados']
      ];
      const found = candidates.find(Array.isArray);
      if (Array.isArray(found)) return found.filter(this.isRecord);
    }

    return [];
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  private getString(item: Record<string, unknown>, keys: string[]): string | undefined {
    const value = keys.map(key => item[key]).find(candidate => candidate !== undefined && candidate !== null);
    return value === undefined || value === null ? undefined : String(value);
  }

  private getNumber(item: Record<string, unknown>, keys: string[]): number {
    const value = keys.map(key => item[key]).find(candidate => candidate !== undefined && candidate !== null);
    return Math.max(0, Number(value) || 0);
  }
}
