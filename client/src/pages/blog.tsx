import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Chatbot } from "@/components/chatbot";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { type BlogPost } from "@shared/schema";

export default function Blog() {
  const { slug } = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const { data: singlePost, isLoading: isPostLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${slug}`],
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
    window.location.href = "/";
  };

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.origin + `/blog/${post.slug}`,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.origin + `/blog/${post.slug}`);
      toast({
        title: "Link Copied",
        description: "Blog post URL has been copied to clipboard",
      });
    }
  };

  // Single blog post view
  if (slug) {
    if (isPostLoading) {
      return (
        <div className="min-h-screen bg-cream">
          <Header onCallClick={handleCallClick} />
          <div className="pt-20 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blog post...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!singlePost) {
      return (
        <div className="min-h-screen bg-cream">
          <Header onCallClick={handleCallClick} />
          <div className="pt-20 flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
                <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
                <Button onClick={() => window.location.href = "/blog"} className="btn-coral">
                  View All Posts
                </Button>
              </CardContent>
            </Card>
          </div>
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
              src={singlePost.imageUrl} 
              alt={singlePost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/blog"}
                className="text-white hover:bg-white/20 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className="bg-coral text-white">{singlePost.category}</Badge>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  <Clock className="w-4 h-4" />
                  <span>{singlePost.readTime} min read</span>
                </div>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(singlePost.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{singlePost.title}</h1>
              <p className="text-xl opacity-90">{singlePost.excerpt}</p>
            </div>
          </section>

          {/* Article Content */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="border-coral text-coral">
                      <Tag className="w-3 h-3 mr-1" />
                      {singlePost.category}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleShare(singlePost)}
                    className="border-sage text-sage hover:bg-sage hover:text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {singlePost.content}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-12 p-8 bg-warm-beige rounded-xl text-center">
                  <h3 className="text-2xl font-bold text-forest mb-4">
                    Interested in Farmland Investment?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get expert consultation and find the perfect farmland investment for your needs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => window.location.href = "/#lead-capture"}
                      className="btn-coral"
                    >
                      Schedule Consultation
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCallClick}
                      className="border-teal-dark text-teal-dark hover:bg-teal-dark hover:text-white"
                    >
                      Call Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Posts */}
          <section className="py-16 bg-warm-beige">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-forest mb-8 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {blogPosts
                  .filter(post => post.id !== singlePost.id && post.category === singlePost.category)
                  .slice(0, 3)
                  .map((post) => (
                    <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className="bg-coral/20 text-coral">{post.category}</Badge>
                          <span className="text-gray-500 text-sm">{post.readTime} min read</span>
                        </div>
                        <h3 className="text-xl font-semibold text-forest mb-3">{post.title}</h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <Button
                          variant="ghost"
                          onClick={() => window.location.href = `/blog/${post.slug}`}
                          className="text-coral hover:text-orange-600 p-0 h-auto font-medium"
                        >
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <Chatbot />
      </div>
    );
  }

  // Blog listing view
  const categories = [...new Set(blogPosts.map(post => post.category))];

  return (
    <div className="min-h-screen bg-cream">
      <Header onCallClick={handleCallClick} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-sage/10 to-coral/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-forest mb-4">
              Farmland Insights & Expert Tips
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay informed with the latest insights on farmland investment, sustainable agriculture, 
              cottage construction, and lifestyle farming across South India.
            </p>
            <Button 
              onClick={() => window.location.href = "/#lead-capture"}
              className="btn-coral"
            >
              Get Expert Consultation
            </Button>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button 
                variant="outline" 
                className="border-coral text-coral hover:bg-coral hover:text-white"
              >
                All Posts ({blogPosts.length})
              </Button>
              {categories.map((category) => (
                <Button 
                  key={category}
                  variant="outline"
                  className="border-sage text-sage hover:bg-sage hover:text-white"
                >
                  {category} ({blogPosts.filter(post => post.category === category).length})
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral mx-auto mb-4"></div>
                <p className="text-gray-600">Loading blog posts...</p>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-forest mb-4">No Blog Posts Available</h3>
                <p className="text-gray-600 mb-6">Check back soon for expert insights and tips.</p>
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="btn-coral"
                >
                  Explore Projects
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => window.location.href = `/blog/${post.slug}`}
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-coral/20 text-coral">{post.category}</Badge>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-forest mb-3 cursor-pointer hover:text-coral transition-colors"
                          onClick={() => window.location.href = `/blog/${post.slug}`}>
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          onClick={() => window.location.href = `/blog/${post.slug}`}
                          className="text-coral hover:text-orange-600 p-0 h-auto font-medium"
                        >
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        <span className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-warm-beige">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-forest mb-4">Stay Updated</h3>
                <p className="text-gray-600 mb-6">
                  Get the latest farmland investment insights and expert tips delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => window.location.href = "/#lead-capture"}
                    className="flex-1 btn-coral"
                  >
                    Subscribe to Updates
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCallClick}
                    className="border-teal-dark text-teal-dark hover:bg-teal-dark hover:text-white"
                  >
                    Talk to Expert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
