const portfolioItems = [
  {
    id: "1",
    title: "Tech Accessories E-commerce Platform",
    description:
      "A complete e-commerce solution for a tech accessories brand. Customers can browse products, place orders, and pay securely online, while the admin has full control over products, inventory, orders, and customers. Built with a modern full-stack architecture and production-ready integrations.",
    category: "E-commerce",
    image_url: "/portfolio/tech-ecommerce-cover.jpg",
    link: "/portfolio/1",
    liveUrl: "https://techstore.example.com", // ← replace with real live URL
    client: "Tech Accessories Brand",
    budget: "Confidential",
    duration: "8 weeks",
    status: "Live",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "PostgreSQL",
      "Paystack",
      "JWT Authentication",
      "Email Integration",
    ],
    features: [
      "Full product catalog with categories, search & filters",
      "Shopping cart & multi-step checkout",
      "Secure online payments with Paystack",
      "User authentication (register / login / password reset)",
      "Admin dashboard for products, orders, customers & inventory",
      "Order management & status tracking",
      "Email notifications for orders, payments & updates",
      "Responsive design optimized for mobile & desktop",
      "Role-based access control",
    ],
    gallery: [
      {
        type: "image",
        url: "/portfolio/tech-ecommerce/home.jpg",
        caption: "Homepage – product showcase",
      },
      {
        type: "image",
        url: "/portfolio/tech-ecommerce/product.jpg",
        caption: "Product detail page",
      },
      {
        type: "image",
        url: "/portfolio/tech-ecommerce/cart.jpg",
        caption: "Shopping cart & checkout",
      },
      {
        type: "image",
        url: "/portfolio/tech-ecommerce/admin-dashboard.jpg",
        caption: "Admin dashboard overview",
      },
      {
        type: "image",
        url: "/portfolio/tech-ecommerce/admin-products.jpg",
        caption: "Product management panel",
      },
      {
        type: "image",
        url: "/portfolio/tech-ecommerce/admin-orders.jpg",
        caption: "Order management",
      },
      {
        type: "video",
        url: "/portfolio/tech-ecommerce/demo.mp4",
        caption: "Full walkthrough – customer & admin flows",
      },
    ],
    results:
      "Successfully launched a production-ready online store with secure payments, automated email notifications, and a powerful admin panel. Currently live and processing real customer orders.",
    deployment: {
      frontend: "Vercel",
      backend: "Render",
      database: "PostgreSQL (Render)",
    },
  },
  {
    id: "2",
    title: "Affiliate Marketing Platform",
    description:
      "A complete affiliate program platform that allows the business to manage partners, track referrals, calculate commissions, and handle payouts. Affiliates get their own dashboard to monitor performance, while admins have full visibility and control over the entire program.",
    category: "SaaS / Affiliate",
    image_url: "/portfolio/affiliate-platform-cover.jpg",
    link: "/portfolio/2",
    liveUrl: "https://affiliate.example.com", // ← replace with real live URL
    client: "Affiliate Program Client",
    budget: "Confidential",
    duration: "7 weeks",
    status: "Live",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "PostgreSQL",
      "JWT Authentication",
      "Email Integration",
    ],
    features: [
      "Affiliate registration & approval system",
      "Unique referral links & tracking",
      "Real-time commission calculation",
      "Affiliate dashboard with performance analytics",
      "Admin panel for managing affiliates, commissions & payouts",
      "Payout request & history system",
      "Email notifications for registrations, approvals & payouts",
      "Role-based access (Admin / Affiliate)",
      "Responsive design for desktop and mobile",
    ],
    gallery: [
      {
        type: "image",
        url: "/portfolio/affiliate/landing.jpg",
        caption: "Affiliate program landing page",
      },
      {
        type: "image",
        url: "/portfolio/affiliate/affiliate-dashboard.jpg",
        caption: "Affiliate dashboard – earnings & stats",
      },
      {
        type: "image",
        url: "/portfolio/affiliate/referral-links.jpg",
        caption: "Referral link management",
      },
      {
        type: "image",
        url: "/portfolio/affiliate/admin-overview.jpg",
        caption: "Admin overview dashboard",
      },
      {
        type: "image",
        url: "/portfolio/affiliate/admin-affiliates.jpg",
        caption: "Affiliate management panel",
      },
      {
        type: "image",
        url: "/portfolio/affiliate/payouts.jpg",
        caption: "Commission & payout system",
      },
      {
        type: "video",
        url: "/portfolio/affiliate/demo.mp4",
        caption: "Platform demo – affiliate & admin flows",
      },
    ],
    results:
      "Delivered a fully functional affiliate platform currently live in production. Affiliates can track referrals and earnings in real time, while the admin has complete control over the program.",
    deployment: {
      frontend: "Vercel",
      backend: "Render",
      database: "PostgreSQL (Render)",
    },
  },
];

export default portfolioItems;