import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { StatisticsService } from '../data-access/statistics.service';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import { HttpErrorResponse } from '@angular/common/http';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-events-statistics',
  imports: [CommonModule, MatExpansionModule, BaseChartDirective, MatCardModule, MatTooltipModule,
    MatIconModule
  ],
  templateUrl: './events-statistics.component.html',
  styleUrl: './events-statistics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsStatisticsComponent {
  readonly panelOpenState = signal(false);
  private statsService = inject(StatisticsService);

  isLoading = signal(true);

  enrollmentChart = signal<any>(null);
  evaluationTypeChart = signal<any>(null);
  modalityChart = signal<any>(null);
  categoriesChart = signal<any>(null);
  surveyChart = signal<any>(null);
  capacityChart = signal<any>(null);
  topEventsChart = signal<any>(null);
  specialtiesChart = signal<any>(null);
  monthlyChart = signal<any>(null);
  rawStats = signal<any>(null);

  downloadDataTooltipText = 'Descargar datos';
  tooltipDuration = 25;

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    try {
      const stats = await this.statsService.getEventsStatistics();

      this.rawStats.set(stats);

      // Gráfico: tipo de inscripción
      this.enrollmentChart.set({
        labels: ['Abierto', 'Restringido'],
        datasets: [{
          label: 'Eventos',
          data: [stats.enrollmentType.open, stats.enrollmentType.restricted],
          backgroundColor: ['#4caf50', '#ff9800']
        }]
      });

      this.evaluationTypeChart.set({
        labels: ['Aprovechamiento', 'Participación'],
        datasets: [{
          label: 'Eventos',
          data: [stats.evaluationType.leveraging, stats.evaluationType.participation],
          backgroundColor: ['#81D4FA	', '#FFF59D']
        }]
      });

      // Gráfico: modalidad
      this.modalityChart.set({
        labels: ['Virtual', 'Presencial'],
        datasets: [{
          label: 'Eventos',
          data: [stats.modality.virtual, stats.modality.presencial],
          backgroundColor: ['#03a9f4', '#8bc34a']
        }]
      });

      // Gráfico: categorías
      this.categoriesChart.set({
        labels: Object.keys(stats.categories),
        datasets: [{
          data: Object.values(stats.categories),
          label: 'Eventos',
          backgroundColor: '#ba68c8'
        }]
      });

      // Gráfico: con/sin encuesta
      this.surveyChart.set({
        labels: ['Con encuesta', 'Sin encuesta'],
        datasets: [{
          label: 'Eventos',
          data: [stats.withSurvey, stats.withoutSurvey],
          backgroundColor: ['#ffb300', '#e0e0e0']
        }]
      });

      // Gráfico: capacidad total vs usada
      this.capacityChart.set({
        labels: ['Cupos totales', 'Inscripciones usadas'],
        datasets: [{
          label: 'Eventos',
          data: [stats.capacity.total, stats.capacity.used],
          backgroundColor: ['#9ccc65', '#f44336']
        }]
      });

      // Gráfico: top 5 eventos
      this.topEventsChart.set({
        labels: stats.topEvents.map((e: any) => e.title.length > 20 ? e.title.slice(0, 17) + '...' : e.title),
        datasets: [{
          data: stats.topEvents.map((e: any) => e.count),
          label: 'Inscripciones',
          backgroundColor: '#9575cd'
        }]
      });

      // Gráfico: especialidades
      this.specialtiesChart.set({
        labels: Object.keys(stats.specialties),
        datasets: [{
          data: Object.values(stats.specialties),
          label: 'Eventos',
          backgroundColor: '#ff7043'
        }]
      });

      // Gráfico: distribución por mes
      this.monthlyChart.set({
        labels: Object.keys(stats.monthlyDistribution),
        datasets: [{
          data: Object.values(stats.monthlyDistribution),
          label: 'Eventos',
          backgroundColor: '#4dd0e1'
        }]
      });

    } catch (err) {
      console.error('Error cargando estadísticas de eventos', err);

      const isBlockedByClient =
        err instanceof HttpErrorResponse &&
        err.status === 0 &&
        (err.statusText === 'Unknown Error' || err.message.includes('ERR_BLOCKED_BY_CLIENT'));

      if (isBlockedByClient) {
        // toast.error('No se pudo cargar la información de los eventos. Si estás usando AdBlock u otra extensión de bloqueo, desactívala para esta página.');
        toast('⚠ Atención: contenido bloqueado', {
          description:
            'Si estás usando AdBlock u otra extensión similar, desactívala para esta página y vuelve a recargarla para ver las estadísticas de eventos.',
          duration: Infinity,
          action: {
            label: 'Entendido',
            onClick: () => {
              toast.dismiss();
            }
          }
        });
      } else {
        toast.error('Error al cargar las estadísticas de eventos.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  downloadCSV() {
    const stats = this.rawStats();
    if (!stats) {
      toast.warning('No se pudo generar el archivo. Por favor recarga la página e intenta de nuevo.')
      return
    };

    const rows = [
      { metrica: 'Tipo de inscripción', dato: this.formatObject(stats.enrollmentType) },
      { metrica: 'Modalidad', dato: this.formatObject(stats.modality) },
      { metrica: 'Categorías de eventos', dato: this.formatObject(stats.categories) },
      { metrica: 'Eventos con encuesta', dato: stats.withSurvey },
      { metrica: 'Eventos sin encuesta', dato: stats.withoutSurvey },
      {
        metrica: 'Capacidad vs Uso',
        dato: `Total: ${stats.capacity.total}, Usado: ${stats.capacity.used}`
      },
      {
        metrica: 'Top 5 eventos con más participantes',
        dato: stats.topEvents.map((e: any) => `${e.title} (${e.count})`).join('; ')
      },
      { metrica: 'Especialidades', dato: this.formatObject(stats.specialties) },
      { metrica: 'Distribución mensual', dato: this.formatObject(stats.monthlyDistribution) }
    ];

    const headerIntro = [
      [],
      ['     ProSTEM: Programa de formación en Ciencia, Tecnología, Ingeniería y Matemática'],
      ['Estadísticas de los eventos'],
      [],
      ['métrica', 'dato']
    ];

    const dataRows = rows.map(r => [r.metrica, r.dato]);
    const fullCsvArray = [...headerIntro, ...dataRows];

    const bom = '\uFEFF';

    const csv = bom + fullCsvArray.map(line => line.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = DateTime.now().toFormat("dd'-'LL'-'yyyy");
    a.href = url;
    a.download = `ProSTEM_estadisticas_EVENTOS_${now}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatObject(obj: Record<string, any>): string {
    return Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(',');
  }
}
