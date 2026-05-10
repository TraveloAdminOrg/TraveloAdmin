// Mirrors the `data` payload of GET /report/overview.

export interface ReportRange {
  startDate: string;
  endDate: string;
}

export interface ReportRidesSummary {
  total: number;
  completed: number;
  cancelled: number;
  revenue: number;
  averageFare: number;
  // Already a percentage 0–100 (e.g. 22.12 = 22.12%).
  completionRate: number;
  cancellationRate: number;
  totalDistance: number;
  totalDuration: number;
}

export interface ReportTransactionTypeBreakdown {
  count: number;
  amount: number;
}

export interface ReportTransactionsSummary {
  total: number;
  byType: Record<string, ReportTransactionTypeBreakdown>;
}

export interface ReportReviewsSummary {
  total: number;
  averageDriverRating: number;
  averageCustomerRating: number;
}

export interface ReportUsersSummary {
  newCustomers: number;
  newDrivers: number;
  activeDrivers: number;
}

export interface ReportOverview {
  range: ReportRange;
  rides: ReportRidesSummary;
  transactions: ReportTransactionsSummary;
  reviews: ReportReviewsSummary;
  users: ReportUsersSummary;
}

// Mirrors the `data.drivers` payload of GET /report/leaderboard.
export interface LeaderboardEntry {
  rank: number;
  driverId: string;
  completedRides: number;
  totalRevenue: number;
  averageFare: number;
  totalDistance: number;
  totalDuration: number;
  averageRating: number;
  totalReviews: number;
  driver: {
    _id: string;
    username?: string;
    fullName?: string;
    email?: string;
    image?: string;
    country?: string;
    city?: string;
  };
}

export interface LeaderboardResponse {
  range: ReportRange;
  drivers: LeaderboardEntry[];
}

// --- Legacy chart shapes (kept for the dashboard's legacy fallback queries) ---

export interface RevenuePoint {
  date: string;
  amount: number;
}

export interface RidesPoint {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

// Display shape used by the dashboard leaderboard list. Kept compatible with
// the legacy /report/drivers payload so the fallback path still type-checks.
export interface DriverLeaderboardEntry {
  driverId: string;
  driverName: string;
  rides: number;
  revenue: number;
  rating?: number;
}
