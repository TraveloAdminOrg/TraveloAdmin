export interface Review {
  _id: string;
  ride?: string;
  customer?: string;
  driver?: string;
  customerRating: number;
  customerFeedback?: string;
  createdAt?: string;
  updatedAt?: string;
}
