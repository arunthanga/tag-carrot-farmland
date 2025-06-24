import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onViewDetails: (slug: string) => void;
  onScheduleVisit: (projectId: number) => void;
}

export function ProjectCard({ project, onViewDetails, onScheduleVisit }: ProjectCardProps) {
  const getProjectColor = (projectType: string): string => {
    switch (projectType) {
      case 'coconut': return 'coral';
      case 'spice': return 'sage';
      case 'backwater': return 'teal-dark';
      case 'hill-station': return 'green-600';
      default: return 'coral';
    }
  };

  const getProjectBadge = (projectType: string): string => {
    switch (projectType) {
      case 'coconut': return 'Featured';
      case 'spice': return 'New';
      case 'backwater': return 'Premium';
      case 'hill-station': return 'Popular';
      default: return 'Featured';
    }
  };

  const color = getProjectColor(project.projectType);

  return (
    <Card className="bg-warm-beige overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img 
        src={project.imageUrl} 
        alt={project.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-forest">{project.name}</h3>
          <span className={`bg-${color} text-white px-3 py-1 rounded-full text-sm`}>
            {getProjectBadge(project.projectType)}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{project.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`text-2xl font-bold text-${color}`}>₹{project.pricePerSqFt}</span>
            <span className="text-gray-500">/sq ft</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Location</div>
            <div className="font-medium text-forest">{project.location}</div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => onViewDetails(project.slug)}
            className={`flex-1 btn-${color}`}
          >
            View Details
          </Button>
          <Button 
            variant="outline"
            onClick={() => onScheduleVisit(project.id)}
            className={`border-${color} text-${color} hover:bg-${color} hover:text-white`}
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
