export interface Faq {
  _id: string;
  question: string;
  answer: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export type FaqCreateInput = {
  question: string;
  answer: string;
  order: number;
};

export type FaqUpdateInput = Partial<FaqCreateInput>;
