import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, Shield, Home, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { Chatbot } from "@/components/chatbot";
import { useToast } from "@/hooks/use-toast";
import { type Project } from "@shared/schema";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { toast } = useToast();

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/projects/${slug}`],
    enabled: !!slug,
  });

  const handleCallClick = () => {
    window.location.href = "tel:+919876543210";
    toast({
      title: "Initiating Call",
      description: "Connecting you to our consultation team...",
    });
  };

  const goBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
            <Button onClick={goBack} className="btn-coral">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header onCallClick={handleCallClick} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <img 
            src={project.imageUrl} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <Button 
              variant="ghost" 
              onClick={goBack}
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">{project.name}</h1>
            <p className="text-xl opacity-90 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {project.location}
            </p>
          </div>
        </section>

        {/* Project Details */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-forest mb-4">About This Project</h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {project.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-forest mb-4">Investment Details</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per sq ft</span>
                            <span className="font-semibold text-coral">₹{project.pricePerSqFt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expected Returns</span>
                            <span className="font-semibold text-green-600">{project.expectedReturns}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Water Source</span>
                            <span className="font-semibold">{project.waterAvailability}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cottage Permitted</span>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-forest mb-4">Project Features</h3>
                        <div className="space-y-2">
                          {project.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Why Choose This Project */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-forest mb-6">Why Choose {project.name}?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="text-coral w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-forest mb-2">Tax-Free Returns</h3>
                        <p className="text-gray-600 text-sm">Agricultural income is completely tax-free</p>
                      </CardContent>
                    </Card>

                    <Card className="text-center">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Home className="text-sage w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-forest mb-2">Weekend Cottage</h3>
                        <p className="text-gray-600 text-sm">Build your dream weekend retreat</p>
                      </CardContent>
                    </Card>

                    <Card className="text-center">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-teal-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="text-teal-dark w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-forest mb-2">Full Management</h3>
                        <p className="text-gray-600 text-sm">Professional farm management included</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-forest">Schedule a Site Visit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-coral/10 rounded-lg">
                      <div className="text-2xl font-bold text-coral">₹{project.pricePerSqFt}</div>
                      <div className="text-sm text-gray-600">per sq ft</div>
                    </div>
                    
                    <Button 
                      className="w-full btn-coral"
                      onClick={() => {
                        const form = document.getElementById('lead-capture');
                        if (form) {
                          form.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Site Visit
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-coral text-coral hover:bg-coral hover:text-white"
                      onClick={handleCallClick}
                    >
                      Call for More Info
                    </Button>

                    <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Free site visit</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Expert consultation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Legal documentation support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Capture Form */}
        <LeadCaptureForm onCallClick={handleCallClick} />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
