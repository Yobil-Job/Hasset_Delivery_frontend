import api from '../utils/api';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQRequest {
  question: string;
  answer: string;
  category: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const faqService = {
  // Public: Get all active FAQs (for customer UI)
  async getActiveFAQs(): Promise<FAQ[]> {
    const response = await api.get<FAQ[]>('/faqs');
    return response.data;
  },

  // Admin: Get all FAQs (including inactive)
  async getAllFAQs(): Promise<FAQ[]> {
    const response = await api.get<FAQ[]>('/admin/faqs');
    return response.data;
  },

  // Admin: Get FAQ by ID
  async getFAQById(id: number): Promise<FAQ> {
    const response = await api.get<FAQ>(`/admin/faqs/${id}`);
    return response.data;
  },

  // Admin: Create FAQ
  async createFAQ(request: FAQRequest): Promise<FAQ> {
    const response = await api.post<FAQ>('/admin/faqs', request);
    return response.data;
  },

  // Admin: Update FAQ
  async updateFAQ(id: number, request: FAQRequest): Promise<FAQ> {
    const response = await api.put<FAQ>(`/admin/faqs/${id}`, request);
    return response.data;
  },

  // Admin: Delete FAQ
  async deleteFAQ(id: number): Promise<void> {
    await api.delete(`/admin/faqs/${id}`);
  },

  // Admin: Toggle FAQ status
  async toggleFAQStatus(id: number): Promise<FAQ> {
    const response = await api.put<FAQ>(`/admin/faqs/${id}/toggle-status`, {});
    return response.data;
  },
};
