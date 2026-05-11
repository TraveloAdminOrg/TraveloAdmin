// Lightweight ride excerpt embedded on a review document.
export interface ReviewRide {
  _id: string;
  region?: string;
  status?: string;
  currency?: string;
  fare?: number;
  createdAt?: string;
  completedAt?: string;
}

// Populated customer/driver — same shape for both since they both come from
// the users collection. Backend only sends the fields the admin UI cares about.
export interface ReviewPerson {
  _id: string;
  username?: string;
  email?: string;
  phone?: string;
  image?: string;
  country?: string;
  city?: string;
  fullName?: string;
}

export interface Review {
  _id: string;
  // Populated on the GET list endpoint. Defensive against the older API shape
  // that returned a bare ObjectId string.
  ride?: ReviewRide | string;
  customer?: ReviewPerson | string;
  driver?: ReviewPerson | string;
  customerRating: number;
  customerFeedback?: string;
  createdAt?: string;
  updatedAt?: string;
}
