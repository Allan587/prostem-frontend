import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../data-access/statistics.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { MatSelectModule } from '@angular/material/select';
import { UsersStatisticsComponent } from "../users-statistics/users-statistics.component";
import { EventsStatisticsComponent } from "../events-statistics/events-statistics.component";

@Component({
  selector: 'app-general-statistics',
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule,
    BaseChartDirective, MatSelectModule, UsersStatisticsComponent, EventsStatisticsComponent],
  templateUrl: './general-statistics.component.html',
  styleUrl: './general-statistics.component.css'
})
export default class GeneralStatisticsComponent {
  private statisticsService = inject(StatisticsService);

  totalUsers = signal(0);
  totalCourses = signal(0);
  totalSurveys = signal(0);

  monthlyLabels = signal<string[]>([]);
  monthlyValues = signal<number[]>([]);

  educationLabels = ['Primaria', 'Secundaria'];
  educationValues = signal<number[]>([]);

  selectedMonths = signal(6); // number of months

  isLoading = signal(true);

  barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize:
            1
        }
      }
    }
  };

  doughnutChartOptions = {
    responsive: true,
    cutout: '70%',
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize:
            1
        }
      }
    }
  };

  ngOnInit() {
    this.getGeneralStats();
  }

  async getGeneralStats() {
    const data = await this.statisticsService.getGeneralStats(this.selectedMonths());
    if (!data) return;

    this.totalUsers.set(data.totalUsers);
    this.totalCourses.set(data.totalCourses);
    this.totalSurveys.set(data.totalSurveys);

    // Process bar chart
    const monthlyData = data.monthlyRegistrations;
    this.monthlyLabels.set(Object.keys(monthlyData));
    this.monthlyValues.set(Object.values(monthlyData));

    // Process pie chart
    const edu = data.educationSplit;
    this.educationValues.set([edu.primaria, edu.secundaria]);

    this.isLoading.set(false);
  }

  changePeriod(value: number) {
    this.selectedMonths.set(value);
    this.getGeneralStats();
  }

}
