import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Keja<span className="text-brand-400">Find</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed">
              Kenya's most trusted rental platform. Find your perfect home or list your property with ease.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-brand-400 hover:bg-dark-700 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-brand-400 hover:bg-dark-700 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-brand-400 hover:bg-dark-700 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Browse Homes', to: '/' },
                { label: 'List Property', to: '/list-property' },
                { label: 'About Us', to: '/about' }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-dark-400 hover:text-brand-400 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-white font-semibold mb-4">Property Types</h3>
            <ul className="space-y-3">
              {['Apartments', 'Bedsitters', 'Studios', 'Townhouses', 'Villas', 'Commercial'].map((item) => (
                <li key={item}>
                  <span className="text-dark-400 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                Nairobi, Kenya
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                +254 700 000 000
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                info@kejafind.co.ke
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} KejaFind. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-dark-500 text-sm hover:text-dark-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-dark-500 text-sm hover:text-dark-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
