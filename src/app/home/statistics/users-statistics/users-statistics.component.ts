import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { StatisticsService } from '../data-access/statistics.service';
import { toast } from 'ngx-sonner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { DateTime } from 'luxon';

type Specialization = { name: string; count: number };

@Component({
  selector: 'app-users-statistics',
  imports: [CommonModule, MatExpansionModule, MatCardModule, MatIconModule, BaseChartDirective, MatTooltipModule],
  templateUrl: './users-statistics.component.html',
  styleUrl: './users-statistics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersStatisticsComponent {
  readonly panelOpenState = signal(false);
  private statsService = inject(StatisticsService);

  isLoading = signal(true);

  ageStats = signal<{ average: number; min: number; max: number } | null>(null);
  rawUserStats = signal<any>(null);   // used to export to CSV
  rolesChartData = signal<any>(null);
  participationData = signal<any>(null);
  specializationsData = signal<any>(null);


  rolesChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  }

  participationChartOptions = {
    responsive: true,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true, stepSize: 1 } }
  }

  specializationsChartOptions = {
    responsive: true,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true, stepSize: 1 } }
  }

  downloadDataTooltipText = 'Descargar datos';
  tooltipDuration = 25;

  async ngOnInit() {
    await this.loadUserStatistics();
  }

  async loadUserStatistics() {
    try {
      this.isLoading.set(true);

      const data = await this.statsService.getUsersStatistics();

      if (data) {
        this.rawUserStats.set(data);
        this.ageStats.set(data.ageStats || null);

        // Chart: roles
        const roleLabels = Object.keys(data.roles);
        const roleValues = Object.values(data.roles);
        this.rolesChartData.set({
          labels: roleLabels,
          datasets: [{
            label: 'Usuarios',
            data: roleValues,
            backgroundColor: ['#2196F3', '#4CAF50', '#FF9800']
          }]
        });

        // Chart: eventos
        const partLabels = Object.keys(data.eventsParticipation);
        const partValues = Object.values(data.eventsParticipation);
        this.participationData.set({
          labels: partLabels,
          datasets: [{
            data: partValues,
            label: 'Usuarios',
            backgroundColor: '#61d5e7'
          }]
        });

        // Chart: especializaciones
        const specLabels = data.topSpecializations.map((s: any) => s.name);
        const specValues = data.topSpecializations.map((s: any) => s.count);
        this.specializationsData.set({
          labels: specLabels,
          datasets: [{
            data: specValues,
            label: 'Usuarios',
            backgroundColor: '#7986cb'
          }]
        });
      }

    } catch (error) {
      console.error('Ocurrió un error obteniendo las estadísticas de los usuarios', error);
      toast.error('Ocurrió un error obteniendo las estadísticas de los usuarios');
    } finally {
      this.isLoading.set(false);
    }

  }

  downloadCSV() {
    const stats = this.rawUserStats();
    if (!stats) return;

    const specializations = stats.topSpecializations as Specialization[];
    const rows = [
      { metrica: 'roles', dato: this.formatObject(stats.roles) },
      { metrica: 'instituciones', dato: this.formatObject(stats.institutions) },
      { metrica: 'ageStats', dato: `avg: ${stats.ageStats.average}, min: ${stats.ageStats.min}, max: ${stats.ageStats.max}` },
      { metrica: 'Top especializaciones', dato: specializations.map(s => `${s.name}: ${s.count}`).join(',') },
      { metrica: 'Participación en eventos', dato: this.formatObject(stats.eventsParticipation) }
    ];

    const headerIntro = [
      [],
      ['     ProSTEM: Programa de formación en Ciencia, Tecnología, Ingeniería y Matemática'],
      ['Estadísticas de los usuarios'],
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
    a.href = url;
    const now = DateTime.now().toFormat("dd'-'LL'-'yyyy");
    a.download = `ProSTEM_estadisticas_USUARIOS_${now}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatObject(obj: Record<string, any>): string {
    return Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(',');
  }

}
