export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  email: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  category: 'Software' | 'Services' | 'Hardware';
  region: string;
}

export interface ChartData {
  name: string;
  value: number;
  revenue: number;
}

export interface KPIMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export enum TabView {
  OVERVIEW = 'overview',
  DATA_GRID = 'data_grid',
  CLIENT_ONBOARDING = 'client_onboarding'
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: number | undefined;
  totalCount: number;
}

export interface SortState {
  key: keyof Transaction;
  direction: 'asc' | 'desc';
}

// --- Dynamic Form Types ---

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'number';
  placeholder?: string;
  sectionId: string;
  width?: 'full' | 'half' | 'third';
  description?: string;
  optionsKey?: string; // Key to lookup in ReferenceData
  required?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
}

export interface FormConfig {
  sections: FormSection[];
  fields: FormFieldConfig[];
}

export interface ReferenceData {
  [key: string]: { label: string; value: string }[];
}