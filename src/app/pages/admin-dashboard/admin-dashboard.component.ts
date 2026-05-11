import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  loading = true;
  error = false;

  activeUsersTab: 'semaine' | 'mois' = 'semaine';
  activePostsTab: 'semaine' | 'mois' = 'semaine';

  stats: Stat[] = [
    { label: 'Utilisateurs', value: '0', icon: 'people',      color: 'text-blue-600',    bg: 'bg-blue-50'    },
    { label: 'Posts',        value: '0', icon: 'article',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Catégories',  value: '0', icon: 'folder',      color: 'text-amber-500',   bg: 'bg-amber-50'   },
    { label: 'Modérateurs', value: '0', icon: 'shield',       color: 'text-purple-600',  bg: 'bg-purple-50'  }
  ];

  moderateurs: any[] = [];
  categoriesPercent: { name: string; percent: number }[] = [];

  weeklyUsers:  { name: string; inscrits: number }[] = [];
  monthlyUsers: { name: string; inscrits: number }[] = [];
  weeklyPosts:  { name: string; posts: number }[] = [];
  monthlyPosts: { name: string; posts: number }[] = [];

  private usersChart: Chart | null = null;
  private postsChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  private dataLoaded = false;
  private viewReady  = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardFull().subscribe({
      next: (data) => {
        this.stats[0].value = data.summary.users.toLocaleString();
        this.stats[1].value = data.summary.posts.toLocaleString();
        this.stats[2].value = data.summary.categories.toLocaleString();
        this.stats[3].value = data.summary.moderateurs.toLocaleString();

        this.weeklyUsers  = data.usersChart.semaine;
        this.monthlyUsers = data.usersChart.mois;
        this.weeklyPosts  = data.postsChart.semaine;
        this.monthlyPosts = data.postsChart.mois;
        this.categoriesPercent = data.categoriesPercent;
        this.moderateurs = data.moderateurs;

        this.loading = false;
        this.dataLoaded = true;
        if (this.viewReady) this.renderAllCharts();
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.dataLoaded) this.renderAllCharts();
  }

  ngOnDestroy(): void {
    this.usersChart?.destroy();
    this.postsChart?.destroy();
    this.categoryChart?.destroy();
  }

  // =========================
  // RENDER ALL
  // =========================
  private renderAllCharts(): void {
    setTimeout(() => {
      this.renderUsersChart();
      this.renderPostsChart();
      this.renderCategoryChart();
    }, 100);
  }

  // =========================
  // USERS CHART (Line)
  // =========================
  private renderUsersChart(): void {
    const canvas = document.getElementById('usersChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.usersChart?.destroy();

    const data = this.activeUsersTab === 'semaine' ? this.weeklyUsers : this.monthlyUsers;

    this.usersChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: 'Utilisateurs inscrits',
          data: data.map(d => d.inscrits),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#64748b',
            bodyColor: '#1e293b',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} utilisateur(s)`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#94a3b8',
              font: { size: 12 },
              stepSize: 1,
              callback: (v) => Number.isInteger(v) ? v : ''
            }
          }
        }
      }
    });
  }

  // =========================
  // POSTS CHART (Bar)
  // =========================
  private renderPostsChart(): void {
    const canvas = document.getElementById('postsChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.postsChart?.destroy();

    const data = this.activePostsTab === 'semaine' ? this.weeklyPosts : this.monthlyPosts;

    this.postsChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: 'Posts publiés',
          data: data.map(d => d.posts),
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderColor: '#8b5cf6',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#64748b',
            bodyColor: '#1e293b',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} post(s)`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#94a3b8',
              font: { size: 12 },
              stepSize: 1,
              callback: (v) => Number.isInteger(v) ? v : ''
            }
          }
        }
      }
    });
  }

  // =========================
  // CATEGORY CHART (Doughnut)
  // =========================
  private renderCategoryChart(): void {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.categoryChart?.destroy();

    if (!this.categoriesPercent.length) return;

    const colors = [
      '#2563eb', '#8b5cf6', '#10b981', '#f59e0b',
      '#ef4444', '#06b6d4', '#ec4899', '#64748b'
    ];

    this.categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.categoriesPercent.map(c => c.name),
        datasets: [{
          data: this.categoriesPercent.map(c => c.percent),
          backgroundColor: colors.slice(0, this.categoriesPercent.length),
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              font: { size: 12, weight: 'bold' },
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10
            }
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#64748b',
            bodyColor: '#1e293b',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (ctx) => ` ${ctx.label} : ${ctx.parsed}%`
            }
          }
        }
      }
    });
  }

  // =========================
  // TAB SWITCH
  // =========================
  setUsersTab(tab: 'semaine' | 'mois'): void {
    this.activeUsersTab = tab;
    this.renderUsersChart();
  }

  setPostsTab(tab: 'semaine' | 'mois'): void {
    this.activePostsTab = tab;
    this.renderPostsChart();
  }
}