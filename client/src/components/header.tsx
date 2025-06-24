import { MapPin, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

interface HeaderProps {
  onCallClick: () => void;
}

export function Header({ onCallClick }: HeaderProps) {
  const { language, t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/attached_assets/TagCarrot_1750742244492.png" 
              alt="Tag Carrot Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-xl font-bold text-forest">Tag Carrot</h1>
              <p className="text-xs text-gray-600">Premium Managed Farmland</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('projects')}
              className="text-forest hover:text-coral transition-colors"
            >
              {t('nav.projects')}
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-forest hover:text-coral transition-colors"
            >
              {t('nav.features')}
            </button>
            <button 
              onClick={() => scrollToSection('blog')}
              className="text-forest hover:text-coral transition-colors"
            >
              {t('nav.blog')}
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-forest hover:text-coral transition-colors"
            >
              {t('nav.contact')}
            </button>
          </nav>

          {/* Language and Call Button */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 flex items-center space-x-1">
              <span>{language === 'en' ? 'English' : language === 'ml' ? 'Malayalam' : 'Tamil'}</span>
              <Globe className="w-4 h-4 text-sage" />
            </div>
            <Button 
              onClick={onCallClick}
              className="btn-coral px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t('nav.callNow')}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
