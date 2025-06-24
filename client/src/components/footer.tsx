import { MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer id="contact" className="bg-forest text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center relative">
                <MapPin className="text-white text-lg" />
                <div className="absolute -top-2 -right-1 w-6 h-8 bg-coral rounded-t-full">
                  <div className="w-4 h-6 bg-sage rounded-t-full mx-auto"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold">Tag Carrot</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Premium managed farmland investments across Kerala and Tamil Nadu for lifestyle and returns.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-coral rounded-full flex items-center justify-center hover:bg-coral/80 transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-coral rounded-full flex items-center justify-center hover:bg-coral/80 transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-coral rounded-full flex items-center justify-center hover:bg-coral/80 transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="hover:text-coral transition-colors"
                >
                  {t('nav.projects')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="hover:text-coral transition-colors"
                >
                  {t('nav.features')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('blog')}
                  className="hover:text-coral transition-colors"
                >
                  {t('nav.blog')}
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-coral transition-colors">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="hover:text-coral transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-coral transition-colors">Farmland Investment</a></li>
              <li><a href="#" className="hover:text-coral transition-colors">Cottage Construction</a></li>
              <li><a href="#" className="hover:text-coral transition-colors">Farm Management</a></li>
              <li><a href="#" className="hover:text-coral transition-colors">Site Visits</a></li>
              <li><a href="#" className="hover:text-coral transition-colors">Legal Documentation</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone text-coral"></i>
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-coral"></i>
                <span>info@tagcarrot.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt text-coral mt-1"></i>
                <span>123 Green Avenue, Kochi, Kerala 682001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Tag Carrot. All rights reserved. | Managed Farmland Investment Solutions</p>
        </div>
      </div>
    </footer>
  );
}
