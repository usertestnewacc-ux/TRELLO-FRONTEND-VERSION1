import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';
import { DashboardReport } from './report.types';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private readonly apiUrl = apiUrl;

  getDashboardReport(): Promise<DashboardReport> {
    return firstValueFrom(this.http.get<DashboardReport>(`${this.apiUrl}/reports/dashboard`));
  }
}
