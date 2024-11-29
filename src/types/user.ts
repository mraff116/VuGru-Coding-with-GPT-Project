export type UserType = {
  id: string;
  name: string;
  email: string;
  userType: 'videographer' | 'client';
  company?: string;
  rating?: number;
  specialties?: string[];
  portfolioUrl?: string;
  createdAt: string;
};