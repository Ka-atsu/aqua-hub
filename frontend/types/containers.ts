// types/containers.ts

export interface ContainerBalance {
  id: string;
  customerName: string;
  phoneNumber: string | null;
  outstandingBalance: number;
  lastActivityDate: string;
}
