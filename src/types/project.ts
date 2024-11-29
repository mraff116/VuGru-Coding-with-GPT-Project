export type ProjectType = {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  description: string;
  status: 'pending' | 'accepted' | 'declined' | 'awaiting_info' | 'quoted';
  date: string;
  deliverables: string[];
  budget: string;
  location: string;
  clientEmail: string;
  videographerId: string;
  createdAt: string;
  lastMessage?: string;
  lastUpdate?: string;
  quotedPrice?: string;
  estimatedDuration?: string;
  includedServices?: string[];
  comments?: {
    id: string;
    text: string;
    createdAt: string;
    author: string;
    authorId: string;
  }[];
};