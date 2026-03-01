"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 transition-colors duration-300">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        {/* Branding */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Prime Estates
          </h2>
          <p className="mt-2 text-sm md:text-base leading-relaxed">
            Premium real estate solutions across Kenya. Find your dream property
            with us.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex-1">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm md:text-base">
            <li>
              <Link
                href="/"
                className="hover:text-black dark:hover:text-white transition"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/properties"
                className="hover:text-black dark:hover:text-white transition"
              >
                Properties
              </Link>
            </li>
            <li>
              <Link
                href="/agents"
                className="hover:text-black dark:hover:text-white transition"
              >
                Agents
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-black dark:hover:text-white transition"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex-1">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
            Contact Us
          </h3>
          <p className="text-sm md:text-base">
            123 Prime Street, Nairobi, Kenya
          </p>
          <p className="text-sm md:text-base mt-1">
            Email: maraspot.ke@gmail.com
          </p>
          <p className="text-sm md:text-base mt-1">Phone: +254 113 388 120</p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            <Link
              href="#"
              aria-label="Facebook"
              className="hover:text-blue-600 transition"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="#"
              aria-label="Twitter"
              className="hover:text-blue-400 transition"
            >
              <Twitter size={20} />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="hover:text-pink-500 transition"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="#"
              aria-label="LinkedIn"
              className="hover:text-blue-700 transition"
            >
              <Linkedin size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 text-center py-4 text-sm md:text-base text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Prime Estates. All rights reserved.
      </div>
    </footer>
  );
}
