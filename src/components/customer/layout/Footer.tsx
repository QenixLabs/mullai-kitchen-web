import { Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F1F5F9] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Tagline */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#333333] mb-2">Mullai Kitchen</h2>
          <p className="text-[#6B7280] max-w-md">
            Revolutionizing food subscriptions with authentic flavors and consistent quality across Chennai
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Explore Column */}
          <div>
            <h3 className="font-semibold text-[#333333] mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Weekly Menu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Gifts & Meals
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Corporate Plans
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Our Kitchens
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-[#333333] mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#6B7280] hover:text-[#FF6B35] transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold text-[#333333] mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[#6B7280]">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <a
                  href="mailto:hello@mullaikitchen.in"
                  className="hover:text-[#FF6B35] transition-colors"
                >
                  hello@mullaikitchen.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#6B7280]">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a
                  href="tel:+914424901234"
                  className="hover:text-[#FF6B35] transition-colors"
                >
                  +91 44 2490 1234
                </a>
              </li>
              <li className="flex items-start gap-2 text-[#6B7280]">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>
                  Old Mahabalipuram Road, Kottivakkam, Chennai - 600041
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 mb-8"></div>

        {/* Bottom Section: Social Icons & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[#FF6B35] hover:opacity-80 transition-opacity"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-[#FF6B35] hover:opacity-80 transition-opacity"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[#6B7280] text-sm">
            © {currentYear} Mullai Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
