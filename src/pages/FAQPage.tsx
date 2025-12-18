import { HelpCircle, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { SEO } from '../components/global/SEO';
import { Card3D } from '../components/global/Card3D';
import { GlassCard } from '../components/global/GlassCard';
import { ScrollReveal } from '../components/global/ScrollReveal';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { faqService, FAQ } from '../services/faqService';
import { toast } from 'sonner';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'General': 'from-blue-500 to-cyan-500',
  'Pricing & Payment': 'from-green-500 to-emerald-500',
  'Shipping & Delivery': 'from-orange-500 to-red-500',
  'Insurance & Safety': 'from-purple-500 to-pink-500',
  'Account & Orders': 'from-indigo-500 to-purple-500',
  'Technical Support': 'from-teal-500 to-cyan-500',
};

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await faqService.getActiveFAQs();

      if (Array.isArray(data)) {
        setFaqs(data);
      } else if (data && Array.isArray((data as any).faqs)) {
        // Handle wrapped response shapes like { faqs: [...] }
        setFaqs((data as any).faqs);
      } else {
        console.error('Unexpected FAQ response format:', data);
        setFaqs([]);
      }
    } catch (error: any) {
      console.error('Failed to load FAQs:', error);
      toast.error('Failed to load FAQs. Please try again later.');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  // Group FAQs by category and transform to match UI structure
  const faqCategories = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push({
      question: faq.question,
      answer: faq.answer,
    });
    return acc;
  }, {} as Record<string, Array<{ question: string; answer: string }>>);

  // Convert to array format with gradients
  const faqCategoriesArray = Object.keys(faqCategories)
    .sort()
    .map((category) => ({
      category,
      gradient: CATEGORY_GRADIENTS[category] || 'from-gray-500 to-gray-600',
      questions: faqCategories[category].sort((a, b) => 
        a.question.localeCompare(b.question)
      ),
    }));

  // Filter FAQs based on search query
  const filteredFAQs = faqCategoriesArray.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen">
      <SEO 
        title="FAQ - ሀሴት Delivery"
        description="Find answers to frequently asked questions about ሀሴት Delivery services, pricing, shipping, and more."
      />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">Frequently Asked Questions</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                How Can We Help?
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12">
                Find quick answers to common questions about our services
              </p>

              {/* Search Bar */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <ScrollReveal>
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-muted-foreground">Loading FAQs...</p>
              </div>
            </ScrollReveal>
          ) : filteredFAQs.length === 0 ? (
            <ScrollReveal>
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl text-foreground mb-2">
                  {searchQuery ? 'No results found' : 'No FAQs available'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Check back later for frequently asked questions'}
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="space-y-12">
              {filteredFAQs.map((category, categoryIndex) => (
                <ScrollReveal key={categoryIndex} delay={categoryIndex * 0.1}>
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        className={`bg-gradient-to-br ${category.gradient} w-12 h-12 rounded-xl flex items-center justify-center`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <HelpCircle className="h-6 w-6 text-white" />
                      </motion.div>
                      <h2 className="text-3xl text-foreground">
                        {category.category}
                      </h2>
                    </div>

                    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                            <AccordionTrigger className="text-left transition-colors">
                              <span className="text-lg text-foreground">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-12 text-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block mb-6"
                >
                  <HelpCircle className="h-16 w-16 text-white" />
                </motion.div>
                <h2 className="text-4xl text-white mb-4">
                  Still Have Questions?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Our support team is here to help you 24/7
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Contact Support
                    </Button>
                  </Link>
                  <a href="mailto:support@hasetdelivery.com">
                    <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                      Email Us
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}