// Mirrors the `data` payload of GET /adminDashboard/.
export interface DashboardKpis {
  totalTodayRevenue: number;
  totalTodayRides: number;
  todayActiveUsers: number;
  totalPendingApprovals: number;
  // Already a percentage (e.g. 31.43 = 31.43%), not a 0–1 ratio.
  totalCancellationRate: number;
  totalTodayAverageFare: number;
  totalActiveRides: number;
}
