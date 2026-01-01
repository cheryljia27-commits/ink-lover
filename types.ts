
export interface Ink {
  id: string;
  name: string;
  brand: string;
  color: string;
  capacity: number;
  remaining: number;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  inkId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface AppData {
  inks: Ink[];
  records: UsageRecord[];
  version: string;
  exportedAt: string;
}

export type ViewType = 'shelf' | 'refill' | 'stats' | 'manage' | 'sync';
