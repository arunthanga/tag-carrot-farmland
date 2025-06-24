import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { insertLeadSchema, type Project } from "@shared/schema";
import { z } from "zod";

const leadFormSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadCaptureFormProps {
  onCallClick: () => void;
}

export function LeadCaptureForm({ onCallClick }: LeadCaptureFormProps) {
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      projectInterest: "",
      budget: "",
      purpose: "",
      requirements: "",
      language,
      source: "website",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormValues) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your consultation request has been submitted. Our team will contact you soon.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    createLeadMutation.mutate({ ...data, language });
  };

  return (
    <section id="lead-capture" className="py-16 bg-gradient-to-r from-coral to-orange-500">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Your Farmland Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get expert consultation and find the perfect farmland investment for your lifestyle and budget.
          </p>

          <Card className="text-gray-800 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-forest">
                {t('leadForm.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder={t('leadForm.name')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder={t('leadForm.email')} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder={t('leadForm.mobile')} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectInterest"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('leadForm.projectInterest')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project: Project) => (
                                <SelectItem key={project.id} value={project.slug}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('leadForm.budget')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5-10">₹5-10 Lakhs</SelectItem>
                              <SelectItem value="10-25">₹10-25 Lakhs</SelectItem>
                              <SelectItem value="25-50">₹25-50 Lakhs</SelectItem>
                              <SelectItem value="50+">₹50+ Lakhs</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('leadForm.purpose')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="investment">Investment Returns</SelectItem>
                              <SelectItem value="cottage">Weekend Cottage</SelectItem>
                              <SelectItem value="farming">Hobby Farming</SelectItem>
                              <SelectItem value="retirement">Retirement Planning</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder={t('leadForm.requirements')} 
                            rows={3} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      className="flex-1 btn-coral py-3 font-semibold"
                      disabled={createLeadMutation.isPending}
                    >
                      {createLeadMutation.isPending ? "Submitting..." : t('leadForm.submit')}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={onCallClick}
                      className="border-2 border-coral text-coral hover:bg-coral hover:text-white font-semibold flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{t('nav.callNow')}</span>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
