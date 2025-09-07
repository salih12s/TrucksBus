import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}
