import { axiosInstance } from "@/utils/axiosInstance";

export interface ServiceMedia {
  image_url?: string | null;
  video_url?: string | null;
  is_cover?: boolean;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  is_featured?: boolean;
  is_active?: boolean;
  cover_image?: string | null;
  media?: ServiceMedia[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServicePrices = Record<string, any>;

export async function getActiveServices(): Promise<Service[]> {
  try {
    const res = await axiosInstance.get<Service[]>("/api/web-services");
    const data = Array.isArray(res.data) ? res.data : [];
    return data.filter((s) => s.is_active);
  } catch (err) {
    // Never throw: the page and sitemap should still build if the API is down
    console.error("Failed to fetch services", err);
    return [];
  }
}

export async function getServicePrices(): Promise<ServicePrices> {
  try {
    const res = await axiosInstance.get<ServicePrices>(
      "/api/web-services/prices",
    );
    return res.data || {};
  } catch (err) {
    console.error("Failed to fetch prices", err);
    return {};
  }
}
