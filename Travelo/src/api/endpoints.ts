// Centralized endpoint paths. Keep them relative to VITE_API_BASE_URL.
// TODO: Replace placeholder paths with real ones from your backend.

export const ENDPOINTS = {
  auth: {
    login: "/admin/sign",
    refresh: "/admin/refresh-token",
    logout: "/admin/logout",
    me: "/admin/me",
  },
  users: {
    base: "/admin/customers/",
    byId: (id: string) => `/admin/customers/${id}`,
    block: (id: string) => `/admin/customers/${id}/block`,
    regionCounts: "/admin/customers/region-counts",
  },
  drivers: {
    base: "/admin/drivers/",
    byId: (id: string) => `/admin/drivers/${id}`,
    approve: (id: string) => `/admin/drivers/${id}/approve`,
    reject: (id: string) => `/admin/drivers/${id}/reject`,
    block: (id: string) => `/admin/drivers/${id}/block`,
    pendingApprovals: "/admin/drivers/pending-approval",
  },
  rides: {
    base: "/admin/rides/",
    byId: (id: string) => `/admin/rides/${id}`,
    active: "/admin/rides/active",
    byUser: (userId: string) => `/admin/users/${userId}/rides`,
    byDriver: (driverId: string) => `/admin/drivers/${driverId}/rides`,
  },
  payments: {
    base: "/admin/transactions/",
    byId: (id: string) => `/admin/transactions/${id}`,
    refund: (id: string) => `/admin/transactions/${id}/refund`,
  },
  reviews: {
    base: "/review/",
    byId: (id: string) => `/review/${id}`,
  },
  notifications: {
    base: "/admin/notifications/",
    byId: (id: string) => `/admin/notifications/${id}`,
    send: "/admin/notifications/send",
  },
  adverts: {
    base: "/ad/",
    byId: (id: string) => `/ad/${id}`,
  },
  dispatch: {
    overview: "/admin/live-dispatch/overview",
    activeDrivers: "/admin/live-dispatch/active-drivers",
    activeRides: "/admin/live-dispatch/active-rides",
  },
  reports: {
    overview: "/report/overview",
    leaderboard: "/report/leaderboard",
    // Kept for legacy callers that still reference these names; the underlying
    // endpoints don't exist on the new backend and will 404.
    revenue: "/report/revenue",
    rides: "/report/rides",
    drivers: "/report/leaderboard",
    export: (resource: string) => `/report/export/${resource}`,
  },
  fares: {
    base: "/fares",
    byId: (id: string) => `/fares/${id}`,
  },
  roles: {
    base: "/roles",
    byId: (id: string) => `/roles/${id}`,
    permissions: "/roles/permissions",
  },
  // Content is keyed by `type` (e.g. privacy_policy) — there's no list endpoint.
  content: {
    add: "/content/add",
    get: "/content/get",
    edit: "/content/edit",
    remove: "/content/delete",
  },
  rideTypes: {
    base: "/rideType/",
    byId: (id: string) => `/rideType/${id}`,
  },
  pricings: {
    base: "/fare",
    list: "/fare/",
    byId: (id: string) => `/fare/${id}`,
  },
  // TODO: confirm path with backend — assumed `/region/` to match the `/fare/` convention.
  regions: {
    base: "/region",
    list: "/region/",
    byId: (id: string) => `/region/${id}`,
  },
  faqs: {
    base: "/faq/",
    byId: (id: string) => `/faq/${id}`,
  },
  dashboard: {
    kpis: "/adminDashboard/",
    revenueTrend: "/adminDashboard/revenue-trend",
    regionsOverview: "/adminDashboard/regions-overview",
    ridesTrend: "/adminDashboard/rides-trend",
    driverStatus: "/adminDashboard/driver-status",
    pendingApprovals: "/adminDashboard/pending-approvals",
    reviewsNeedingAttention: "/adminDashboard/reviews-needing-attention",
    topDrivers: "/adminDashboard/top-drivers",
    latestRides: "/adminDashboard/latest-rides",
  },
} as const;
