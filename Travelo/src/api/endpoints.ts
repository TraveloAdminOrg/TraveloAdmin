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
    base: "/admin/users/",
    byId: (id: string) => `/admin/users/${id}`,
    block: (id: string) => `/admin/users/${id}/block`,
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
    base: "/admin/reviews/",
    byId: (id: string) => `/admin/reviews/${id}`,
  },
  notifications: {
    base: "/admin/notifications/",
    byId: (id: string) => `/admin/notifications/${id}`,
    send: "/admin/notifications/send",
  },
  adverts: {
    base: "/admin/adverts/",
    byId: (id: string) => `/admin/adverts/${id}`,
  },
  dispatch: {
    activeDrivers: "/admin/dispatch/active-drivers",
    activeRides: "/admin/dispatch/active-rides",
  },
  reports: {
    overview: "/admin/reports/overview",
    revenue: "/admin/reports/revenue",
    rides: "/admin/reports/rides",
    drivers: "/admin/reports/drivers",
    export: (resource: string) => `/admin/reports/export/${resource}`,
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
  content: {
    base: "/content",
    byId: (id: string) => `/content/${id}`,
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
} as const;
