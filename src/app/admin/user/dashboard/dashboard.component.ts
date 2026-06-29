import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SessionService } from '../../../core/services/session.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MenuService } from '../../../core/services/menu.service';
import { DashboardsService } from '../../../core/services/dashboards.service';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private cmp_uuid!: string;
  private company!: any;
  public menuItems: any;
  public headerConfig: any = {
    title: "DASHBOARD",
    description: "Estadísticas.",
    icon: "fab fa-dashcube fa-fw"
  }

  private trendsChartInstance: echarts.ECharts | null = null;
  private statesChartInstance: echarts.ECharts | null = null;

  constructor(
    private _sessionService: SessionService,
    private _sharedDataService: SharedDataService,
    private _menuService: MenuService,
    private _dashboardsService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.company = this._sessionService.getCompany();
    this.loadDashboard();

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        this.company = company;
        this.loadDashboard();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.trendsChartInstance) {
      this.trendsChartInstance.dispose();
    }
    if (this.statesChartInstance) {
      this.statesChartInstance.dispose();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (this.trendsChartInstance) {
      this.trendsChartInstance.resize();
    }
    if (this.statesChartInstance) {
      this.statesChartInstance.resize();
    }
  }

  private loadDashboard(): void {
    if(this.company) {
      this.cmp_uuid = this.company.cmp_uuid;
      this._dashboardsService.getDashboards(this.cmp_uuid).subscribe(
        (response: any) => {
          if(response.success) {
            const dashboard = response.data;
            this._menuService.updateDashboardItems(dashboard, this.cmp_uuid).subscribe({
              next: (filteredItems: any[]) => {
                this.menuItems = filteredItems; // ← Esto ahora recibe los items filtrados
                this.loadAnalytics();
              },
              error: (error) => {
                console.error('Error filtering dashboard items:', error);
              }
            });
          }
        },
        error => {
          var errorMessage = <any>error;
          console.log(errorMessage);
        }
      )
    }
  }

  private loadAnalytics(): void {
    if (this.cmp_uuid) {
      this._dashboardsService.getDashboardAnalytics(this.cmp_uuid).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.initCharts(response.data);
          }
        },
        error: (err) => {
          console.error('Error loading dashboard analytics:', err);
        }
      });
    }
  }

  private initCharts(data: any): void {
    const trendsEl = document.getElementById('trendsChart');
    const statesEl = document.getElementById('statesChart');

    if (trendsEl) {
      if (this.trendsChartInstance) {
        this.trendsChartInstance.dispose();
      }
      this.trendsChartInstance = echarts.init(trendsEl);
      
      const dates = data.workTrends.map((t: any) => t.date);
      const counts = data.workTrends.map((t: any) => t.count);

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'line' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#aaa' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLine: { lineStyle: { color: '#aaa' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
        },
        series: [{
          name: 'Trabajos Registrados',
          type: 'line',
          data: counts,
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          itemStyle: {
            color: '#00b4d8'
          },
          lineStyle: {
            width: 3,
            color: '#00b4d8'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 180, 216, 0.3)' },
              { offset: 1, color: 'rgba(0, 180, 216, 0)' }
            ])
          }
        }]
      };
      this.trendsChartInstance.setOption(option);
    }

    if (statesEl) {
      if (this.statesChartInstance) {
        this.statesChartInstance.dispose();
      }
      this.statesChartInstance = echarts.init(statesEl);

      const stateData = data.workStates.map((s: any) => ({
        name: s.name,
        value: s.value
      }));

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: '0%',
          left: 'center',
          textStyle: { color: '#666' }
        },
        series: [
          {
            name: 'Estados de Trabajo',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: stateData
          }
        ]
      };
      this.statesChartInstance.setOption(option);
    }
  }
}
