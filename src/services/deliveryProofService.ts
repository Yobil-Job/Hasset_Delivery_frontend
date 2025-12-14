import api from '../utils/api';

export interface DeliveryProof {
    id: number;
    imageUrl: string;
    uploadedAt: string;
    uploadedBy: string;
}

export interface DeliveryProofsResponse {
    proofs: DeliveryProof[];
}

export const deliveryProofService = {
    uploadProof: async (orderNumber: string, file: File): Promise<{ proofId: number; imageUrl: string; uploadedAt: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(
            `/orders/${orderNumber}/delivery-proof`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    getProofs: async (orderNumber: string): Promise<DeliveryProof[]> => {
        const response = await api.get<DeliveryProofsResponse>(
            `/orders/${orderNumber}/delivery-proof`
        );
        return response.data.proofs || [];
    }
};

