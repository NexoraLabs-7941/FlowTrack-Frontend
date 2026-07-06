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

export interface AfluenciaHistorialRecord {
  fecha: string;
  diaSemana: string;
  hora: number;
  horaInicio: string;
  horaFin: string;
  rangoHora: string;
  camaraId: string;
  totalIngresos: number;
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

  getCamarasDisponibles(): Observable<string[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}${environment.afluenciaCamarasEndpointPath}`)
      .pipe(map(response => this.extractStringArray(response)));
  }

  getHistorial(filters: {
    camaraId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<AfluenciaHistorialRecord[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}${environment.afluenciaHistorialEndpointPath}`, {
        params: this.buildHistorialParams(filters)
      })
      .pipe(map(response => this.normalizeHistorial(response)));
  }

  exportHistorialCsv(filters: {
    camaraId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${environment.afluenciaHistorialExportEndpointPath}`, {
      params: this.buildHistorialParams(filters),
      responseType: 'blob'
    });
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

  private normalizeHistorial(response: unknown): AfluenciaHistorialRecord[] {
    const items = this.extractArray(response);
    if (items.some(item => item['fechaHora'] || item['timestamp'] || item['tipoMovimiento'] || item['evento'])) {
      return this.groupRawHistorialByHour(items);
    }

    return items.map(item => ({
      fecha: this.getString(item, ['fecha', 'date']) ?? '',
      diaSemana: this.getString(item, ['diaSemana', 'dayOfWeek']) ?? '',
      hora: this.getNumber(item, ['hora', 'hour']),
      horaInicio: this.getString(item, ['horaInicio', 'startHour']) ?? '',
      horaFin: this.getString(item, ['horaFin', 'endHour']) ?? '',
      rangoHora: this.getString(item, ['rangoHora', 'hourRange']) ?? '',
      camaraId: this.getString(item, ['camaraId', 'camara_id']) ?? '',
      totalIngresos: this.getNumber(item, ['totalIngresos', 'cantidad', 'total'])
    }));
  }

  private buildHistorialParams(filters: {
    camaraId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): HttpParams {
    let params = new HttpParams();
    params = params.set('tipoMovimiento', 'ingreso');
    if (filters.camaraId?.trim()) params = params.set('camaraId', filters.camaraId.trim());
    if (filters.fechaInicio?.trim()) params = params.set('fechaInicio', filters.fechaInicio.trim());
    if (filters.fechaFin?.trim()) params = params.set('fechaFin', filters.fechaFin.trim());
    return params;
  }

  private groupRawHistorialByHour(items: Record<string, unknown>[]): AfluenciaHistorialRecord[] {
    const groups = new Map<string, AfluenciaHistorialRecord>();

    items.forEach(item => {
      const movement = (this.getString(item, ['tipoMovimiento', 'evento']) ?? '').toLowerCase();
      if (movement && movement !== 'ingreso') return;

      const rawDate = this.getString(item, ['fechaHora', 'timestamp']);
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const fecha = this.formatDateKey(date);
      const hora = date.getHours();
      const camaraId = this.getString(item, ['camaraId', 'camara_id']) ?? '';
      const key = `${fecha}|${hora}|${camaraId}`;
      const horaInicio = this.formatHour(hora);
      const horaFin = this.formatHour((hora + 1) % 24);
      const existing = groups.get(key);

      if (existing) {
        existing.totalIngresos += this.getNumber(item, ['cantidad', 'total']);
        return;
      }

      groups.set(key, {
        fecha,
        diaSemana: this.getSpanishWeekday(date),
        hora,
        horaInicio,
        horaFin,
        rangoHora: `${horaInicio} - ${horaFin}`,
        camaraId,
        totalIngresos: this.getNumber(item, ['cantidad', 'total'])
      });
    });

    return Array.from(groups.values()).sort((left, right) => {
      const dateCompare = right.fecha.localeCompare(left.fecha);
      if (dateCompare !== 0) return dateCompare;
      if (right.hora !== left.hora) return right.hora - left.hora;
      return left.camaraId.localeCompare(right.camaraId);
    });
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  private getSpanishWeekday(date: Date): string {
    return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][date.getDay()];
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

  private extractStringArray(response: unknown): string[] {
    if (Array.isArray(response)) {
      return response
        .map(item => String(item ?? '').trim())
        .filter(Boolean);
    }

    if (this.isRecord(response)) {
      const candidates = [response['content'], response['data'], response['items'], response['records']];
      const found = candidates.find(Array.isArray);
      if (Array.isArray(found)) {
        return found
          .map(item => String(item ?? '').trim())
          .filter(Boolean);
      }
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
