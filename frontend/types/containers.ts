// types/containers.ts

export interface ContainerBalance {
  id: string;
  customerName: string;
  phoneNumber: string | null;
  totalBorrowed: number;
  totalReturned: number;
  outstandingBalance: number;
  lastActivityDate: string;
}
