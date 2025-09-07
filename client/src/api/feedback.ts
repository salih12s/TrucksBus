import apiClient from "./client";

export interface CreateFeedbackRequest {
  title: string;
  description: string;
  category: "TECHNICAL" | "UI_UX" | "FEATURE_REQUEST" | "BUG_REPORT" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: "OPEN" | "REVIEWED" | "RESPONDED";
  response?: string;
  adminResponseAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface FeedbackResponse {
  success: boolean;
  data: Feedback;
  message?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data: Feedback[];
  message?: string;
}

export interface UpdateFeedbackStatusRequest {
  status: "OPEN" | "REVIEWED" | "RESPONDED";
  response?: string;
}

export const feedbackAPI = {
  // Kullanıcı feedback oluşturma
  createFeedback: async (
    data: CreateFeedbackRequest
  ): Promise<FeedbackResponse> => {
    const response = await apiClient.post("/feedback", data);
    return response.data as FeedbackResponse;
  },

  // Kullanıcının kendi feedback'lerini getirme
  getUserFeedbacks: async (): Promise<FeedbackListResponse> => {
    const response = await apiClient.get("/feedback/my");
    return response.data as FeedbackListResponse;
  },

  // Admin: Tüm feedback'leri getirme
  getAllFeedbacks: async (): Promise<FeedbackListResponse> => {
    const response = await apiClient.get("/feedback/all");
    return response.data as FeedbackListResponse;
  },

  // Admin: Feedback durumu güncelleme
  updateFeedbackStatus: async (
    feedbackId: string,
    data: UpdateFeedbackStatusRequest
  ): Promise<FeedbackResponse> => {
    const response = await apiClient.put(`/feedback/${feedbackId}`, data);
    return response.data as FeedbackResponse;
  },

  // Belirli bir feedback'i getirme
  getFeedback: async (feedbackId: string): Promise<FeedbackResponse> => {
    const response = await apiClient.get(`/feedback/${feedbackId}`);
    return response.data as FeedbackResponse;
  },
};

export default feedbackAPI;
