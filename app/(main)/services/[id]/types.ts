export interface Media {
  id: string;
  image_url?: string;
  video_url?: string;
  is_cover?: boolean;
}
export interface Extra {
  id: string;
  title: string;
  price: number;
}
export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  delivery_days: number;
  revisions: number | string;
  pages?: number | string;
  products?: number | string;
  features?: string[];
  type: string;
}
export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
export interface Service {
  id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  packages: Package[];
  media?: Media[];
  extras?: Extra[];
  faqs?: FAQ[];
}
