import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container animate-in">
      <div class="dashboard-hero">
        <div class="hero-left">
          <div class="user-greeting">
            <div class="avatar avatar-lg avatar-primary">{{ auth.initials() }}</div>
            <div>
              <h1 class="page-title">Welcome back, {{ auth.displayName() }}!</h1>
              <p class="page-subtitle">Manage your workspaces, boards, and track team progress from one place.</p>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <span class="badge badge-blue">{{ auth.role() }}</span>
        </div>
      </div>

      <div class="grid-3 dashboard-quick-actions">
        <div class="card action-card">
          <div class="card-body">
            <span class="action-icon">💼</span>
            <h3>Workspaces</h3>
            <p>Organize boards, invite team members, and delegate roles.</p>
            <a routerLink="/workspaces" class="btn btn-primary btn-sm">Manage Workspaces</a>
          </div>
        </div>

        <div class="card action-card">
          <div class="card-body">
            <span class="action-icon">📋</span>
            <h3>Project Boards</h3>
            <p>Access your project boards, columns, and task cards.</p>
            <a routerLink="/boards" class="btn btn-primary btn-sm">View Boards</a>
          </div>
        </div>

        <div class="card action-card">
          <div class="card-body">
            <span class="action-icon">📊</span>
            <h3>Reports & Analytics</h3>
            <p>Analyze due dates, priority distribution, and status charts.</p>
            <a routerLink="/reports" class="btn btn-primary btn-sm">View Analytics</a>
          </div>
        </div>
      </div>

      <div class="dashboard-details grid-2">
        <!-- Account Info -->
        <div class="card info-panel">
          <div class="card-header">Account Details</div>
          <div class="card-body info-list">
            <div class="info-row">
              <span class="info-label">Email Address</span>
              <span class="info-value">{{ auth.user()?.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Security Role</span>
              <span class="info-value badge badge-gray">{{ auth.role() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">User ID</span>
              <span class="info-value text-monospace">{{ auth.userId() || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Activity & Audit logs shortcut -->
        <div class="card activity-panel">
          <div class="card-header">Logs & Operations</div>
          <div class="card-body">
            <p class="panel-desc">View audit trails and logs of everything happening in your workspaces.</p>
            <div class="panel-actions">
              <a routerLink="/activity-logs" class="btn btn-secondary btn-full">
                <span>🕒</span> View Activity Logs
              </a>
              <a *ngIf="auth.role() === 'Admin'" routerLink="/admin" class="btn btn-danger btn-full">
                <span>🔐</span> Access Admin Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-hero {
      background: white;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 28px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      box-shadow: var(--shadow-sm);
    }
    .user-greeting {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .avatar-primary {
      background: linear-gradient(135deg, var(--brand-blue) 0%, #0747a6 100%);
      color: white;
      font-size: 1.25rem;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,82,204,0.2);
    }
    .action-card {
      position: relative;
      overflow: hidden;
    }
    .action-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--brand-blue);
    }
    .action-card:nth-child(2)::before { background: var(--brand-teal); }
    .action-card:nth-child(3)::before { background: var(--brand-purple); }
    
    .action-card h3 {
      font-size: 1.15rem;
      margin-top: 12px;
      margin-bottom: 6px;
      color: var(--text-primary);
    }
    .action-card p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 18px;
      min-height: 40px;
    }
    .action-icon {
      font-size: 2rem;
      display: block;
    }
    .dashboard-quick-actions {
      margin-bottom: 24px;
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-light);
    }
    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .info-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .info-value {
      font-size: 0.9rem;
      color: var(--text-primary);
      font-weight: 600;
    }
    .text-monospace {
      font-family: monospace;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .panel-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 18px;
    }
    .panel-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `]
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}

