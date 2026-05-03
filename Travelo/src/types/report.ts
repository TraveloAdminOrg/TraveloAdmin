// TODO: Align with backend reporting endpoints.

export interface ReportOverview {
  todayRevenue: number;
  todayRides: number;
  activeDrivers: number;
  activeUsers: number;
  pendingApprovals: number;
  cancellationRate: number; // 0–1
  averageFare: number;
  currency: string;
}

export interface RevenuePoint {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface RidesPoint {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface DriverLeaderboardEntry {
  driverId: string;
  driverName: string;
  rides: number;
  revenue: number;
  rating?: number;
}
