import apiClient from "./client";

export interface Complaint {
  id: number;
  adId: number;
  userId: number;
  reason: string;
  description?: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  ad: {
    id: number;
    title: string;
    price: number;
    images: Array<{
      id: number;
      url: string;
      alt?: string;
    }>;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateComplaintRequest {
  adId: number;
  reason: string;
  description?: string;
}

export interface UpdateComplaintStatusRequest {
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  adminResponse?: string;
}

// Create a new complaint
export const createComplaint = async (
  data: CreateComplaintRequest
): Promise<{ complaint: Complaint }> => {
  const response = await apiClient.post("/complaints", data);
  return response.data as { complaint: Complaint };
};

// Get all complaints (user's own or all for admin)
export const getComplaints = async (): Promise<{ complaints: Complaint[] }> => {
  const response = await apiClient.get("/complaints");
  return response.data as { complaints: Complaint[] };
};

// Get a specific complaint by ID
export const getComplaintById = async (
  id: number
): Promise<{ complaint: Complaint }> => {
  const response = await apiClient.get(`/complaints/${id}`);
  return response.data as { complaint: Complaint };
};

// Update complaint status (admin only)
export const updateComplaintStatus = async (
  id: number,
  data: UpdateComplaintStatusRequest
): Promise<{ complaint: Complaint }> => {
  const response = await apiClient.put(`/complaints/${id}/status`, data);
  return response.data as { complaint: Complaint };
};

// Delete complaint
export const deleteComplaint = async (
  id: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/complaints/${id}`);
  return response.data as { message: string };
};
