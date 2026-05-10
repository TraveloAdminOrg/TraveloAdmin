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

export interface RevenueTrendPoint {
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  rideCount: number;
}

// Mirrors the `data` payload of GET /adminDashboard/revenue-trend.
export interface RevenueTrend {
  days: number;
  totalRevenue: number;
  totalRides: number;
  trend: RevenueTrendPoint[];
}

export interface RegionOverview {
  code: string;
  country: string;
  currency: string;
  totalDrivers: number;
  pendingApprovals: number;
  onTripDrivers: number;
  idleDrivers: number;
  activeRidesNow: number;
}

// Mirrors the `data` payload of GET /adminDashboard/regions-overview.
export interface RegionsOverview {
  regions: RegionOverview[];
}

export interface RidesTrendPoint {
  date: string; // YYYY-MM-DD
  total: number;
  completed: number;
  cancelled: number;
}

// Mirrors the `data` payload of GET /adminDashboard/rides-trend.
export interface RidesTrend {
  days: number;
  total: number;
  completed: number;
  cancelled: number;
  trend: RidesTrendPoint[];
}

// Mirrors the `data` payload of GET /adminDashboard/driver-status?region=…
export interface DriverStatus {
  totalDrivers: number;
  activeDrivers: number;
  onRideDrivers: number;
  idleDrivers: number;
  offlineDrivers: number;
  // Already percentages 0–100.
  onRidePercentage: number;
  idlePercentage: number;
}

export interface PendingApprovalDriver {
  _id: string;
  username: string;
  email: string;
  phone: string;
  image?: string;
  country: string;
  isDocumentUploaded: boolean;
  createdAt?: string;
  city?: string;
  fullName?: string;
}

// Mirrors the `data` payload of GET /adminDashboard/pending-approvals.
export interface PendingApprovalsResponse {
  drivers: PendingApprovalDriver[];
  total: number;
}

export interface AttentionReview {
  _id: string;
  ride?: string;
  customer?: string;
  driver?: string;
  customerRating: number;
  customerFeedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mirrors the `data` payload of GET /adminDashboard/reviews-needing-attention.
export interface ReviewsNeedingAttentionResponse {
  reviews: AttentionReview[];
}

export interface TopDriverEntry {
  driverId: string;
  completedRides: number;
  totalRevenue: number;
  averageFare: number;
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

// Mirrors the `data` payload of GET /adminDashboard/top-drivers.
export interface TopDriversResponse {
  days: number;
  startDate: string;
  endDate: string;
  drivers: TopDriverEntry[];
}

export interface LatestRideUserSummary {
  _id: string;
  username?: string;
  email?: string;
  image?: string;
  country?: string;
  city?: string;
  fullName?: string;
}

export interface LatestRide {
  _id: string;
  userId?: LatestRideUserSummary;
  driverId?: LatestRideUserSummary;
  region?: string;
  status: string;
  type?: string;
  passengers?: number;
  estimatedFare?: number;
  fare?: number;
  bid?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  distance?: number;
  duration?: number;
  isCancelled?: boolean;
  isCompleted?: boolean;
  isPaid?: boolean;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mirrors the `data` payload of GET /adminDashboard/latest-rides.
export interface LatestRidesResponse {
  rides: LatestRide[];
}
