'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About */}
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Web Services</h4>
          <p className="text-sm opacity-90">
            We deliver modern, responsive, and scalable web solutions tailored for your business.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h5 className="font-semibold">Quick Links</h5>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/services" className="hover:text-blue-500 dark:hover:text-blue-400">
                Services
              </Link>
            </li>
            <li>
              <Link href="/projects" className="hover:text-blue-500 dark:hover:text-blue-400">
                My Projects
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-blue-500 dark:hover:text-blue-400">
                Account
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-500 dark:hover:text-blue-400">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h5 className="font-semibold">Contact</h5>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> maraspot.ke@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +254 113 388 120
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Nairobi, Kenya
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="space-y-2">
          <h5 className="font-semibold">Follow Us</h5>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-blue-500 dark:hover:text-blue-400">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-200">
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 text-center py-4 text-sm opacity-80">
        &copy; {new Date().getFullYear()} Maraspot. All rights reserved.
      </div>
    </footer>
  );
}
