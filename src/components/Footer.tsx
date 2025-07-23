import React from "react";
import Link from "next/link";
import { Mail, PhoneCall, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">PrepForAll</h3>
            <p className="text-slate-400 mb-4">
              Empowering students to achieve academic excellence through comprehensive exam preparation.
            </p>
            <div className="space-y-2">
              <a href="mailto:contact@PrepForAll.com" className="flex items-center text-slate-400 hover:text-primary">
                <Mail className="h-5 w-5 mr-2" />
                contact@PrepForAll.com
              </a>
              <a href="tel:+1234567890" className="flex items-center text-slate-400 hover:text-primary">
                <PhoneCall className="h-5 w-5 mr-2" />
                (123) 456-7890
              </a>
              <div className="flex items-center text-slate-400">
                <MapPin className="h-5 w-5 mr-2" />
                123 Education St, Learning City
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-primary">Courses</Link>
              </li>
              <li>
                <Link href="/exams" className="text-slate-400 hover:text-primary">Practice Exams</Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-primary">Blog</Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-primary">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-slate-400 hover:text-primary">Help Center</Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-primary">FAQs</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-primary">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-primary">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
            <p className="text-slate-400 mb-4">
              Subscribe to our newsletter for the latest updates and exam tips.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} PrepForAll. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}