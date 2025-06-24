import { useEffect, useRef } from 'react';
import { type Project } from '@shared/schema';

interface InteractiveMapProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export function InteractiveMap({ projects, onProjectClick }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map centered on Kerala
    const map = window.L.map(mapRef.current).setView([10.8505, 76.2711], 8);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add project markers
    projects.forEach((project) => {
      const markerColor = getMarkerColor(project.projectType);
      
      // Create custom icon
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 project-marker cursor-pointer" style="border-color: ${markerColor}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${markerColor}">
              <i class="${getMarkerIcon(project.projectType)} text-white text-sm"></i>
            </div>
          </div>
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 rounded-full text-xs font-medium" style="background-color: ${markerColor}">
            ${project.name}
          </div>
        `,
        iconSize: [64, 80],
        iconAnchor: [32, 40]
      });

      const marker = window.L.marker([project.coordinates.lat, project.coordinates.lng], {
        icon: customIcon
      }).addTo(map);

      marker.on('click', () => {
        onProjectClick(project);
      });

      // Add popup with project preview
      const popupContent = `
        <div class="w-80 max-w-none">
          <img src="${project.imageUrl}" alt="${project.name}" class="w-full h-48 object-cover rounded-lg mb-4" />
          <h3 class="text-lg font-semibold text-forest mb-2">${project.name}</h3>
          <p class="text-gray-600 text-sm mb-3">${project.description}</p>
          <div class="flex items-center justify-between mb-4">
            <span class="font-bold" style="color: ${markerColor}">₹${project.pricePerSqFt}/sq ft</span>
            <span class="text-sage text-sm">${project.location}</span>
          </div>
          <div class="flex space-x-2">
            <button class="flex-1 text-white px-4 py-2 rounded-lg text-sm transition-colors" style="background-color: ${markerColor}" onclick="viewProject('${project.slug}')">
              View Details
            </button>
            <button class="px-4 py-2 border rounded-lg text-sm hover:text-white transition-colors" style="border-color: ${markerColor}; color: ${markerColor}" onclick="scheduleVisit('${project.id}')">
              Schedule Visit
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'custom-popup'
      });
    });

    // Add legend
    const legend = window.L.control({ position: 'bottomleft' });
    legend.onAdd = function() {
      const div = window.L.DomUtil.create('div', 'legend');
      div.innerHTML = `
        <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <h4 class="font-semibold text-forest mb-3">Project Types</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-coral rounded-full"></div>
              <span>Coconut Farmland</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-sage rounded-full"></div>
              <span>Spice Plantations</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-teal-dark rounded-full"></div>
              <span>Backwater Properties</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3" style="background-color: #16a34a"></div>
              <span>Hill Station Retreats</span>
            </div>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [projects, onProjectClick]);

  const getMarkerColor = (projectType: string): string => {
    switch (projectType) {
      case 'coconut': return '#FF6B47'; // coral
      case 'spice': return '#8FBC8F'; // sage
      case 'backwater': return '#2D5A4F'; // teal-dark
      case 'hill-station': return '#16a34a'; // green-600
      default: return '#FF6B47';
    }
  };

  const getMarkerIcon = (projectType: string): string => {
    switch (projectType) {
      case 'coconut': return 'fas fa-leaf';
      case 'spice': return 'fas fa-seedling';
      case 'backwater': return 'fas fa-water';
      case 'hill-station': return 'fas fa-mountain';
      default: return 'fas fa-leaf';
    }
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gradient-to-br from-sage to-teal-dark"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

// Global functions for popup buttons
declare global {
  interface Window {
    viewProject: (slug: string) => void;
    scheduleVisit: (projectId: string) => void;
  }
}

window.viewProject = (slug: string) => {
  window.location.href = `/projects/${slug}`;
};

window.scheduleVisit = (projectId: string) => {
  // Scroll to lead capture form
  const form = document.getElementById('lead-capture');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth' });
    // Focus on project interest select
    setTimeout(() => {
      const select = form.querySelector('select[name="projectInterest"]') as HTMLSelectElement;
      if (select) {
        select.focus();
      }
    }, 500);
  }
};
