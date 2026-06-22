import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { catchError, forkJoin, map, of } from 'rxjs';
import {
  AfluenciaAnaliticaService,
  HoraPicoRecord,
  TraficoDiarioRecord
} from '../../../infrastructure/afluencia-analitica.service';

interface AnalyticsLoadResult<T> {
  records: T[];
  error?: unknown;
}

@Component({
  selector: 'app-afluencia-reportes',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './afluencia-reportes.html',
  styleUrl: './afluencia-reportes.css'
})
export class AfluenciaReportesComponent implements OnInit {
  private readonly afluenciaService = inject(AfluenciaAnaliticaService);
  private readonly dayFormatter = new Intl.DateTimeFormat('es-PE', { weekday: 'long' });
  private readonly today = new Date();

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly traficoDiario = signal<TraficoDiarioRecord[]>([]);
  protected readonly horasPico = signal<HoraPicoRecord[]>([]);

  protected readonly fechaInicio = this.toApiDate(this.addDays(this.today, -6));
  protected readonly fechaFin = this.toApiDate(this.today);
  protected readonly fechaActual = this.toApiDate(this.today);
  protected readonly idCamara = 0;

  protected readonly barChartType: 'bar' = 'bar';
  protected readonly lineChartType: 'line' = 'line';

  protected readonly traficoDiarioChartData = computed<ChartData<'bar'>>(() => {
    const records = this.fillLastSevenDays(this.traficoDiario());
    return {
      labels: records.map(item => item.label),
      datasets: [{
        label: 'Ingresos',
        data: records.map(item => item.totalIngresos),
        backgroundColor: '#2563EB',
        hoverBackgroundColor: '#1D4ED8',
        borderColor: '#1E40AF',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 28
      }]
    };
  });

  protected readonly horasPicoChartData = computed<ChartData<'line'>>(() => {
    const hourlyData = this.fillTwentyFourHours(this.horasPico());
    return {
      labels: hourlyData.map(item => `${item.hora}:00`),
      datasets: [{
        label: 'Personas',
        data: hourlyData.map(item => item.cantidadPersonas),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        pointBackgroundColor: '#059669',
        pointBorderColor: '#FFFFFF',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4
      }]
    };
  });

  protected readonly traficoDiarioChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.92)',
        padding: 12,
        callbacks: {
          label: context => `Ingresos: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E5E7EB' },
        ticks: { precision: 0 }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  protected readonly horasPicoChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.92)',
        padding: 12,
        callbacks: {
          label: context => `Personas: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E5E7EB' },
        ticks: { precision: 0 }
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadAnalytics();
  }

  protected loadAnalytics(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      trafico: this.afluenciaService.getTraficoDiario(this.fechaInicio, this.fechaFin).pipe(
        map((records): AnalyticsLoadResult<TraficoDiarioRecord> => ({ records })),
        catchError(error => of({ records: [] as TraficoDiarioRecord[], error } as AnalyticsLoadResult<TraficoDiarioRecord>))
      ),
      horas: this.afluenciaService.getHorasPico(this.idCamara, this.fechaActual).pipe(
        map((records): AnalyticsLoadResult<HoraPicoRecord> => ({ records })),
        catchError(error => of({ records: [] as HoraPicoRecord[], error } as AnalyticsLoadResult<HoraPicoRecord>))
      )
    }).subscribe(({ trafico, horas }) => {
      this.traficoDiario.set(trafico.records);
      this.horasPico.set(horas.records);

      const error = trafico.error || horas.error;
      if (error) {
        this.errorMessage.set(this.getFriendlyErrorMessage(error));
      }

      this.loading.set(false);
    });
  }

  private getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Tu sesión no está autorizada para consultar la analítica de afluencia. Vuelve a iniciar sesión o revisa los permisos del usuario.';
      }

      if (error.status === 404) {
        return 'El backend local no expone todavía los endpoints de analítica de afluencia.';
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el backend local de analítica.';
      }

      return `No se pudo cargar la analítica de afluencia. Código ${error.status}.`;
    }

    return 'No se pudo cargar la analítica de afluencia.';
  }

  private fillLastSevenDays(records: TraficoDiarioRecord[]): Array<{ label: string; totalIngresos: number }> {
    const totalsByDate = new Map(records.map(record => [record.fecha, record.totalIngresos]));
    const totalsByDay = new Map(
      records.map(record => [this.normalizeDayName(record.diaSemana || record.dia || ''), record.totalIngresos])
    );

    return Array.from({ length: 7 }, (_item, index) => {
      const date = this.addDays(this.today, index - 6);
      const apiDate = this.toApiDate(date);
      const dayName = this.capitalize(this.dayFormatter.format(date));
      return {
        label: dayName,
        totalIngresos: totalsByDate.get(apiDate) ?? totalsByDay.get(this.normalizeDayName(dayName)) ?? 0
      };
    });
  }

  private fillTwentyFourHours(records: HoraPicoRecord[]): HoraPicoRecord[] {
    const totalsByHour = new Map(records.map(record => [record.hora, record.cantidadPersonas]));
    return Array.from({ length: 24 }, (_item, hora) => ({
      hora,
      cantidadPersonas: totalsByHour.get(hora) ?? 0
    }));
  }

  private addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  }

  private toApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeDayName(value: string): string {
    return value.trim().toLocaleLowerCase('es-PE');
  }

  private capitalize(value: string): string {
    return value.charAt(0).toLocaleUpperCase('es-PE') + value.slice(1);
  }
}
