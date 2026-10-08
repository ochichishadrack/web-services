// types/portfolio.ts

/** Media attached to a portfolio project */
export interface PortfolioMedia {
  id: number;
  portfolio_id: number;
  media_type: "image" | "video";
  url: string;
  cloudinary_public_id?: string | null;
  format?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

/** Full portfolio (detail / edit) */
export interface Portfolio {
  id: number;
  public_id?: string;
  title: string;
  slug: string;
  client?: string | null;
  role?: string | null;
  category: string;
  subcategory?: string | null;
  summary?: string | null;
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  tech_stack?: string[] | null;
  features?: string[] | null;
  live_url?: string | null;
  year?: number | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  media?: PortfolioMedia[];
  created_at?: string;
  updated_at?: string;
}

/** List item returned by GET /api/portfolios */
export interface PortfolioListOut {
  id: number;
  public_id?: string;
  title: string;
  slug: string;
  client?: string | null;
  category: string;
  subcategory?: string | null;
  summary?: string | null;
  year?: number | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  primary_media?: PortfolioMedia | null;
  created_at?: string;
}

/** Form values used by PortfolioForm (edit / create UI) */
export interface PortfolioFormValues {
  title: string;
  slug: string;
  client: string;
  role: string;
  category: string;
  subcategory: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  /** Comma-separated in the form UI */
  tech_stack: string;
  /** Comma-separated in the form UI */
  features: string;
  live_url: string;
  year: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: string;
}

/** Payload sent to create / patch endpoints */
export interface PortfolioCreate {
  title: string;
  slug: string;
  client?: string | null;
  role?: string | null;
  category: string;
  subcategory?: string | null;
  summary?: string | null;
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  tech_stack?: string[] | null;
  features?: string[] | null;
  live_url?: string | null;
  year?: number | null;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export type PortfolioUpdate = Partial<PortfolioCreate>;

/** Media update (alt, sort_order, is_primary, etc.) */
export interface PortfolioMediaUpdate {
  alt?: string | null;
  sort_order?: number;
  is_primary?: boolean;
}
