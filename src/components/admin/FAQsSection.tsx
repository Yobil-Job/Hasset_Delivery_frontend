import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  HelpCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Filter,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card3D } from '../global/Card3D';
import { GlassCard } from '../global/GlassCard';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { faqService, FAQ, FAQRequest } from '../../services/faqService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

const FAQ_CATEGORIES = [
  'General',
  'Pricing & Payment',
  'Shipping & Delivery',
  'Insurance & Safety',
  'Account & Orders',
  'Technical Support',
];

const CATEGORY_GRADIENTS: Record<string, string> = {
  'General': 'from-blue-500 to-cyan-500',
  'Pricing & Payment': 'from-green-500 to-emerald-500',
  'Shipping & Delivery': 'from-orange-500 to-red-500',
  'Insurance & Safety': 'from-purple-500 to-pink-500',
  'Account & Orders': 'from-indigo-500 to-purple-500',
  'Technical Support': 'from-teal-500 to-cyan-500',
};

export function FAQsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQRequest>({
    question: '',
    answer: '',
    category: 'General',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await faqService.getAllFAQs();
      setFaqs(data || []);
    } catch (error: any) {
      console.error('Failed to load FAQs:', error);
      toast.error(
        error.response?.data?.error || error.message || 'Failed to load FAQs'
      );
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        displayOrder: faq.displayOrder,
        isActive: faq.isActive,
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        question: '',
        answer: '',
        category: 'General',
        displayOrder: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      displayOrder: 0,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await faqService.updateFAQ(editingFAQ.id, formData);
        toast.success('FAQ updated successfully');
      } else {
        await faqService.createFAQ(formData);
        toast.success('FAQ created successfully');
      }
      handleCloseDialog();
      loadFAQs();
    } catch (error: any) {
      console.error('Failed to save FAQ:', error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to save FAQ'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    try {
      await faqService.deleteFAQ(id);
      toast.success('FAQ deleted successfully');
      loadFAQs();
    } catch (error: any) {
      console.error('Failed to delete FAQ:', error);
      toast.error(
        error.response?.data?.error || error.message || 'Failed to delete FAQ'
      );
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await faqService.toggleFAQStatus(id);
      toast.success('FAQ status updated');
      loadFAQs();
    } catch (error: any) {
      console.error('Failed to toggle FAQ status:', error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          'Failed to update FAQ status'
      );
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  // Sort categories and FAQs within each category
  const sortedCategories = Object.keys(groupedFAQs).sort();
  sortedCategories.forEach((category) => {
    groupedFAQs[category].sort(
      (a, b) => a.displayOrder - b.displayOrder || a.id - b.id
    );
  });

  const stats = [
    {
      title: 'Total FAQs',
      value: faqs.length.toString(),
      icon: HelpCircle,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active FAQs',
      value: faqs.filter((f) => f.isActive).length.toString(),
      icon: Eye,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Categories',
      value: new Set(faqs.map((f) => f.category)).size.toString(),
      icon: Filter,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card3D key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <motion.div
                className={`bg-gradient-to-br ${stat.gradient} w-12 h-12 rounded-xl flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </motion.div>
            </div>
          </Card3D>
        ))}
      </div>

      {/* Actions Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FAQ_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleOpenDialog()} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* FAQs List */}
      {sortedCategories.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No FAQs found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Get started by creating your first FAQ'}
          </p>
          {!searchQuery && categoryFilter === 'all' && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create FAQ
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => (
            <GlassCard key={category} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className={`bg-gradient-to-br ${
                    CATEGORY_GRADIENTS[category] || 'from-gray-500 to-gray-600'
                  } w-10 h-10 rounded-lg flex items-center justify-center`}
                  whileHover={{ scale: 1.1 }}
                >
                  <HelpCircle className="h-5 w-5 text-white" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {category}
                </h2>
                <Badge variant="outline" className="ml-auto">
                  {groupedFAQs[category].length} FAQs
                </Badge>
              </div>
              <div className="space-y-3">
                {groupedFAQs[category].map((faq) => (
                  <motion.div
                    key={faq.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {faq.question}
                          </h3>
                          {!faq.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Order: {faq.displayOrder}</span>
                          <span>
                            Created:{' '}
                            {new Date(faq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(faq.id)}
                          title={faq.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {faq.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter the question"
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Enter the answer"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first within the same category
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible to customers)
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingFAQ ? 'Update' : 'Create'} FAQ
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

