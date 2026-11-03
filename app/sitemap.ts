import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getActiveServices } from "@/lib/services";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Add other public pages here (e.g. /about, /contact, /portfolio)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const services = await getActiveServices();

  // Matches the links used on the services page: /services/${service.id}
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${SITE_URL}/services/${service.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: service.is_featured ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
