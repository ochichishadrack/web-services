import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getActiveServices, getServicePrices } from "@/lib/services";
import ServicesClient from "./ServicesClient";

// Re-generate this page at most every 5 minutes (ISR)
export const revalidate = 300;

const TITLE = "Web & Software Development Services";
const DESCRIPTION =
  "Explore Maraspot's web design, web app and custom software development services. Compare packages, see starting prices and get a project started.";

export const metadata: Metadata = {
  title: TITLE, // becomes "Web & Software Development Services | Maraspot"
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/services",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default async function ServicesPage() {
  // Fetched on the server so crawlers receive the full HTML list of services
  const [services, prices] = await Promise.all([
    getActiveServices(),
    getServicePrices(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/services#webpage`,
        url: `${SITE_URL}/services`,
        name: `${TITLE} | ${SITE_NAME}`,
        description: DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${SITE_URL}/services`,
          },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: services.map((service, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/services/${service.id}`,
          name: service.title,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ServicesClient initialServices={services} initialPrices={prices} />
    </>
  );
}
