// TODO: Align with backend Review/Rating entity.
export type ReviewDirection = "rider_to_driver" | "driver_to_rider";

export interface Review {
  _id: string;
  rideId?: string;
  direction: ReviewDirection;
  rating: number; // 1–5
  comment?: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerImage?: string;
  subjectId: string;
  subjectName?: string;
  subjectImage?: string;
  isFlagged?: boolean;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
