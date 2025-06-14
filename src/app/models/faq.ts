export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
  isPopular?: boolean;
  tags?: string[];
  helpfulCount?: number;
  views?: number;
}

export interface FAQCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
  articleCount?: number;
}