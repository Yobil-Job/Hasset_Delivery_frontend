import api from '../utils/api';

export interface ContactMessage {
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  async sendContactMessage(payload: ContactMessage): Promise<void> {
    await api.post('/contact/send', payload);
  },
};


