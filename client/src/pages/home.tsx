import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Shield, Home as HomeIcon, Users, CheckCircle, TrendingUp, Sprout, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { InteractiveMap } from "@/components/interactive-map";
import { ProjectCard } from "@/components/project-card";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { Chatbot } from "@/components/chatbot";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { type Project, type BlogPost, type Testimonial } from "@shared/schema";

export default function Home() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showChatbot, setShowChatbot] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: featuredProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects/featured"],
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const handleCallClick = () => {
    window.location.href = "tel:+919876543210";
    toast({
      title: "Initiating Call",
      description: "Connecting you to our consultation team...",
    });
  };

  const handleProjectClick = (project: Project) => {
    window.location.href = `/projects/${project.slug}`;
  };

  const handleViewDetails = (slug: string) => {
    window.location.href = `/projects/${slug}`;
  };

  const handleScheduleVisit = (projectId: number) => {
    const form = document.getElementById('lead-capture');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header onCallClick={handleCallClick} />
      
      {/* Hero Map Section - 75% of viewport */}
      <main className="pt-20">
        <section className="relative h-screen">
          {/* Interactive Map - 75% */}
          <div className="h-3/4 relative overflow-hidden">
            <InteractiveMap 
              projects={projects} 
              onProjectClick={handleProjectClick}
            />
          </div>

          {/* Hero Content - 25% */}
          <div className="h-1/4 bg-gradient-to-r from-warm-beige to-cream p-8 flex items-center">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h2 className="text-4xl lg:text-5xl font-bold text-forest mb-4">
                    {t('hero.title')}
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    {t('hero.subtitle')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={() => scrollToSection('projects')}
                      className="btn-coral px-8 py-3 rounded-full flex items-center space-x-2"
                    >
                      <span>{t('hero.exploreProjects')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => scrollToSection('lead-capture')}
                      className="border-2 border-teal-dark text-teal-dark px-8 py-3 rounded-full hover:bg-teal-dark hover:text-white"
                    >
                      {t('hero.scheduleConsultation')}
                    </Button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-forest mb-4">{t('features.title')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-coral/20 rounded-full flex items-center justify-center">
                          <Shield className="text-coral w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-700">{t('features.taxFree')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-sage/20 rounded-full flex items-center justify-center">
                          <HomeIcon className="text-sage w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-700">{t('features.cottage')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-dark/20 rounded-full flex items-center justify-center">
                          <Users className="text-teal-dark w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-700">{t('features.management')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section id="projects" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-forest mb-4">
                Featured Farmland Projects
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Carefully curated farmland opportunities across the most scenic regions of South India, 
                each offering unique lifestyle and investment benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewDetails={handleViewDetails}
                  onScheduleVisit={handleScheduleVisit}
                />
              ))}
            </div>

            {/* Project Comparison */}
            <div className="bg-warm-beige rounded-xl p-8">
              <h3 className="text-2xl font-bold text-forest mb-6 text-center">Compare Our Projects</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-forest">Features</th>
                      {featuredProjects.slice(0, 3).map((project) => (
                        <th key={project.id} className="text-center py-3 px-4 font-semibold text-coral">
                          {project.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium">Price per sq ft</td>
                      {featuredProjects.slice(0, 3).map((project) => (
                        <td key={project.id} className="py-3 px-4 text-center">₹{project.pricePerSqFt}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium">Cottage Permitted</td>
                      {featuredProjects.slice(0, 3).map((project) => (
                        <td key={project.id} className="py-3 px-4 text-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium">Expected Annual Return</td>
                      {featuredProjects.slice(0, 3).map((project) => (
                        <td key={project.id} className="py-3 px-4 text-center">{project.expectedReturns}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Water Availability</td>
                      {featuredProjects.slice(0, 3).map((project) => (
                        <td key={project.id} className="py-3 px-4 text-center">{project.waterAvailability}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gradient-to-br from-sage/10 to-coral/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-forest mb-4">
                Why Choose Managed Farmland?
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Experience the perfect blend of investment returns and lifestyle benefits with our comprehensive farmland management services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-coral w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-3">Tax-Free Returns</h3>
                  <p className="text-gray-600">Enjoy agricultural income benefits with no tax liability on your farmland returns.</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HomeIcon className="text-sage w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-3">Cottage Construction</h3>
                  <p className="text-gray-600">Build your dream weekend cottage with approved construction permits.</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-teal-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-teal-dark w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-3">Full Management</h3>
                  <p className="text-gray-600">Professional farm management takes care of cultivation, harvesting, and marketing.</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-green-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-3">Legal Compliance</h3>
                  <p className="text-gray-600">All properties come with clear titles and complete legal documentation.</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sprout className="text-orange-500 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-3">Sustainable Farming</h3>
                  <p className="text-gray-600">Eco-friendly farming practices that preserve soil health and biodiversity.</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-purple-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest mb-3">Prime Locations</h3>
                  <p className="text-gray-600">Strategically located properties with good connectivity and infrastructure.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-forest mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 text-lg">Real experiences from farmland owners who chose the Tag Carrot lifestyle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-warm-beige shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-forest">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.title}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{testimonial.content}</p>
                    <div className="flex text-coral">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Capture Form */}
        <LeadCaptureForm onCallClick={handleCallClick} />

        {/* Blog Section */}
        <section id="blog" className="py-16 bg-warm-beige">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-forest mb-4">Farmland Insights & Tips</h2>
              <p className="text-gray-600 text-lg">Expert advice on farmland investment, cottage construction, and sustainable farming practices.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="bg-coral/20 text-coral px-3 py-1 rounded-full text-sm">{post.category}</span>
                      <span className="text-gray-500 text-sm">{post.readTime} min read</span>
                    </div>
                    <h3 className="text-xl font-semibold text-forest mb-3">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <a 
                      href={`/blog/${post.slug}`} 
                      className="text-coral hover:text-orange-600 font-medium inline-flex items-center space-x-1"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={() => window.location.href = '/blog'}
                className="bg-forest text-white px-8 py-3 rounded-full hover:bg-gray-800"
              >
                View All Articles
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
