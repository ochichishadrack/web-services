import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Allowed origins for cross-origin requests in development
  // (Next.js 15+)
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:3003",
    "127.0.0.1:3000",
    "127.0.0.1:3003",
    "app.maraspot.com",
    "*.maraspot.com",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "minio.maraspot.com",
      },
           {
        protocol: "https",
        hostname: "dash.maraspot.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      // add more image hosts if needed, e.g. MinIO:
      // {
      //   protocol: "https",
      //   hostname: "minio.maraspot.com",
      // },
    ],
  },
};

export default nextConfig;
