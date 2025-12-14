import api from '../utils/api';

export interface InitializePaymentRequest {
  orderId: number;
}

export interface InitializePaymentResponse {
  checkoutUrl: string;
  txRef: string;
}

export interface VerifyPaymentRequest {
  txRef: string;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  txRef: string;
  chapaReference?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
  payment?: PaymentResponse;
}

export const paymentService = {
  async initializePayment(orderId: number): Promise<InitializePaymentResponse> {
    const response = await api.post<InitializePaymentResponse>('/payments/initialize', {
      orderId,
    });
    return response.data;
  },

  async verifyPayment(txRef: string): Promise<VerifyPaymentResponse> {
    const response = await api.post<VerifyPaymentResponse>('/payments/verify', {
      txRef,
    });
    return response.data;
  },

  async getAllPayments(params?: {
    orderId?: number;
    status?: string;
    txRef?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    payments: PaymentResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.orderId) queryParams.append('orderId', params.orderId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.txRef) queryParams.append('txRef', params.txRef);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await api.get(`/payments/admin?${queryParams.toString()}`);
    return response.data;
  },

  async getPaymentByTxRef(txRef: string): Promise<PaymentResponse> {
    const response = await api.get<PaymentResponse>(`/payments/admin/${txRef}`);
    return response.data;
  },
};

