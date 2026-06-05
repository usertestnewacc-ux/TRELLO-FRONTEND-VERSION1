import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { ReportService } from './report.service';
import { DashboardReport, ChartSegment } from './report.types';

@Component({
  selector: 'reports-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="reports-page">
      <h2>Reports & Analytics</h2>

      <div *ngIf="!auth.isAuthenticated()" class="info-card">
        <p>Please sign in to view dashboard analytics.</p>
      </div>

      <div *ngIf="auth.isAuthenticated()">
        <button class="primary" type="button" (click)="loadReport()">Refresh Report</button>
        <p *ngIf="message()" class="message">{{ message() }}</p>

        <div *ngIf="!report() && !message()" class="info-card">Loading report data...</div>

        <div *ngIf="report()" class="report-grid">
          <div class="report-card">
            <h3>Key Metrics</h3>
            <p>Total Workspaces: {{ report()?.totalWorkspaces }}</p>
            <p>Total Boards: {{ report()?.totalBoards }}</p>
            <p>Total Lists: {{ report()?.totalLists }}</p>
            <p>Total Cards: {{ report()?.totalCards }}</p>
            <p>Avg Cards per List: {{ report()?.averageCardsPerList }}</p>
          </div>

          <div class="report-card">
            <h3>Task Status</h3>
            <p>To Do: {{ report()?.toDoTasks }}</p>
            <p>In Progress: {{ report()?.inProgressTasks }}</p>
            <p>Completed: {{ report()?.completedTasks }}</p>
            <p>Overdue: {{ report()?.overdueTasks }}</p>
          </div>

          <div class="report-card">
            <h3>Priority Breakdown</h3>
            <p>High: {{ report()?.highPriorityTasks }}</p>
            <p>Medium: {{ report()?.mediumPriorityTasks }}</p>
            <p>Low: {{ report()?.lowPriorityTasks }}</p>
          </div>
        </div>

        <div *ngIf="report()" class="chart-panels">
          <div class="chart-card">
            <h3>Status Distribution</h3>
            <ng-container *ngFor="let segment of report()?.statusBreakdown">
              <div class="bar-label">{{ segment.label }} ({{ segment.value }})</div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="segmentPercent(segment)"></div>
              </div>
            </ng-container>
          </div>

          <div class="chart-card">
            <h3>Priority Distribution</h3>
            <ng-container *ngFor="let segment of report()?.priorityBreakdown">
              <div class="bar-label">{{ segment.label }} ({{ segment.value }})</div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="segmentPercent(segment)"></div>
              </div>
            </ng-container>
          </div>

          <div class="chart-card">
            <h3>Assigned Tasks</h3>
            <ng-container *ngFor="let segment of report()?.assigneeBreakdown">
              <div class="bar-label">{{ segment.label }} ({{ segment.value }})</div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="segmentPercent(segment)"></div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    ".reports-page { max-width: 1040px; margin: 2rem auto; padding: 1rem; display: grid; gap: 1.5rem; }",
    ".report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }",
    ".report-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1rem; }",
    ".chart-panels { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }",
    ".chart-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1rem; }",
    ".bar-label { font-size: 0.95rem; margin-bottom: 0.25rem; }",
    ".bar-track { width: 100%; height: 12px; background: #f3f4f6; border-radius: 999px; margin-bottom: 0.9rem; }",
    ".bar-fill { height: 100%; background: #2563eb; border-radius: 999px; }",
    ".primary { padding: 0.8rem 1rem; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }",
    ".info-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; }",
    ".message { margin-top: 1rem; color: #111827; font-weight: 600; }"
  ]
})
export class ReportsComponent implements OnInit {
  report = signal<DashboardReport | null>(null);
  message = signal('');
  private maxValue = signal(1);

  constructor(public auth: AuthService, private reportService: ReportService) {}

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.loadReport();
    }
  }

  async loadReport() {
    this.message.set('');
    try {
      const report = await this.reportService.getDashboardReport();
      this.report.set(report);
      this.maxValue.set(this.calculateMax(report));
    } catch (error) {
      this.message.set((error as Error).message);
      this.report.set(null);
    }
  }

  segmentPercent(segment: ChartSegment) {
    const max = this.maxValue();
    return max <= 0 ? 0 : Math.round((segment.value / max) * 100);
  }

  private calculateMax(report: DashboardReport): number {
    return Math.max(
      ...report.statusBreakdown.map((item) => item.value),
      ...report.priorityBreakdown.map((item) => item.value),
      ...report.assigneeBreakdown.map((item) => item.value),
      1);
  }
}
