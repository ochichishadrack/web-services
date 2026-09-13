"use client";

import Image from "next/image";
import Link from "next/link";
import { Code2, Server, Layers, Cloud, Github, Mail } from "lucide-react";
import portfolioItems from "@/data/portfolioData";

const services = [
  {
    icon: Code2,
    title: "Frontend Development",
    description:
      "Interfaces built for speed and clarity — from marketing sites to complex dashboards.",
    tools: ["React", "Next.js", "Vue.js", "Tailwind CSS", "TypeScript"],
  },
  {
    icon: Server,
    title: "Backend Development",
    description:
      "APIs, databases, and business logic that stay reliable as traffic and features grow.",
    tools: ["FastAPI", "Node.js", "Django", "PostgreSQL", "Redis"],
  },
  {
    icon: Layers,
    title: "Full-Stack Solutions",
    description:
      "One team handling the whole product so frontend and backend are designed together, not stitched together.",
    tools: ["Next.js", "FastAPI", "PostgreSQL", "REST & GraphQL"],
  },
  {
    icon: Cloud,
    title: "DevOps & Deployment",
    description:
      "Your app shipped, monitored, and kept running — on Vercel, Render, VPS, or wherever it needs to live.",
    tools: ["Docker", "Vercel", "Render", "Git", "CI/CD"],
  },
];

const techStack = [
  {
    category: "Frontend",
    items: [
      "React",
      "Next.js",
      "Vue.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "HTML",
      "CSS",
    ],
  },
  {
    category: "Backend",
    items: ["FastAPI", "Node.js", "Express", "Django", "Laravel", "PHP"],
  },
  {
    category: "Database",
    items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase", "Firebase"],
  },
  {
    category: "Deployment & Tools",
    items: ["Docker", "Git", "Vercel", "Render", "VPS", "CI/CD"],
  },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
          alt="Mara Devs Portfolio"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Mara Devs
          </h1>
          <p className="mt-3 text-white/85 text-base md:text-lg max-w-xl leading-relaxed">
            A full-stack development team designing, building, and deploying
            production-ready web solutions.
          </p>
        </div>
      </div>

      {/* Who we are */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Who we are
        </h2>
        <p className="mt-5 text-gray-600 dark:text-gray-400 leading-relaxed text-[15px] md:text-base">
          Mara Devs is a team of developers covering both sides of the stack.
          Our frontend and backend engineers work together on every project, and
          we handle deployment ourselves — whether that&apos;s Vercel, Render, a
          VPS, or another setup that fits what you&apos;re building.
        </p>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center tracking-tight">
          What we do
        </h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-800 hover:border-orange-300/60 dark:hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <service.icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-gray-900 dark:text-white">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {service.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {service.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center tracking-tight">
            Tools we work with
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {techStack.map((group) => (
              <div key={group.category}>
                <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white tracking-wide uppercase">
                  {group.category}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Our work
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto">
            Production-ready platforms we have designed, built, and deployed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {portfolioItems.map((item) => (
            <Link
              key={item.id}
              href={`/portfolio/${item.id}`}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </span>
                  {item.status === "Live" && (
                    <span className="bg-emerald-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 4 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                      +{item.technologies.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.duration}
                  </span>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:underline">
                    View case study →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Have a project in mind?
          </h2>
          <p className="mt-4 text-gray-400 max-w-md mx-auto leading-relaxed text-[15px]">
            Tell us what you&apos;re building and we&apos;ll figure out the
            stack, timeline, and where it should be deployed.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=hello@maradevs.com&su=Project%20Inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              <Mail className="w-4 h-4" />
              Email us
            </a>

            <a
              href="https://wa.me/255700000000?text=Hi%20Mara%20Devs%2C%20I%27d%20like%20to%20discuss%20a%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium px-6 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 hover:-translate-y-0.5"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.85 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            <a
              href="https://github.com/maradevs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-gray-700 hover:border-gray-500 hover:bg-gray-800/60 text-gray-200 text-sm font-medium px-6 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
