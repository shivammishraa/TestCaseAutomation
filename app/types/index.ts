export interface User {
  name: string;
  designation: 'Tester' | 'Developer' | 'AVP' | 'VP' | 'Manager' | 'General Manager';
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  summary: string;
  generatedAt: string;
  downloadUrl: string;
}