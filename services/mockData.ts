import { Transaction, ChartData, PaginatedResponse, SortState, FormConfig, ReferenceData } from '../types';

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'South America', 'Africa'];
const CATEGORIES = ['Software', 'Services', 'Hardware'] as const;
const STATUSES = ['Completed', 'Pending', 'Failed', 'Refunded'] as const;

// --- MOCK DATABASE INITIALIZATION ---
// We generate the "Database" once in memory to simulate a persistent backend.
const DB_SIZE = 50000; // 50k rows in the "Database"
const TRANSACTIONS_DB: Transaction[] = [];

const random = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Populate Mock DB
const now = new Date();
for (let i = 0; i < DB_SIZE; i++) {
  const date = new Date(now.getTime() - Math.floor(random(i) * 10000000000));
  TRANSACTIONS_DB.push({
    id: `TXN-${10000 + i}`,
    date: date.toISOString().split('T')[0],
    customerName: `Customer ${Math.floor(random(i * 2) * 1000)}`,
    email: `user${i}@example.com`,
    amount: parseFloat((random(i * 3) * 1000).toFixed(2)),
    status: STATUSES[Math.floor(random(i * 4) * STATUSES.length)],
    category: CATEGORIES[Math.floor(random(i * 5) * CATEGORIES.length)],
    region: REGIONS[Math.floor(random(i * 6) * REGIONS.length)],
  });
}

// --- MOCK API ENDPOINTS ---

export const fetchDashboardMetrics = async (): Promise<{ chartData: ChartData[] }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((month, idx) => ({
    name: month,
    value: Math.floor(random(idx) * 5000) + 1000,
    revenue: Math.floor(random(idx + 100) * 50000) + 10000,
  }));
  
  return { chartData };
};

export const fetchTransactions = async ({ 
  cursor = 0, 
  pageSize = 50, 
  sort 
}: { 
  cursor?: number; 
  pageSize?: number; 
  sort?: SortState | null 
}): Promise<PaginatedResponse<Transaction>> => {
  
  // Simulate network delay (varied to look realistic)
  await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 200));

  let result = [...TRANSACTIONS_DB];

  // 1. Simulate Server-Side Sorting
  if (sort) {
    result.sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // 2. Simulate Pagination (Slicing)
  const nextCursor = cursor + pageSize < result.length ? cursor + pageSize : undefined;
  const slicedData = result.slice(cursor, cursor + pageSize);

  return {
    data: slicedData,
    nextCursor,
    totalCount: result.length
  };
};

export const fetchFormConfiguration = async (): Promise<FormConfig> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading form config

  return {
    sections: [
      { id: 'personal', title: 'Personal Information', description: 'Basic identity details.' },
      { id: 'financial', title: 'Financial Profile', description: 'Income and employment info.' },
      { id: 'risk', title: 'Risk Assessment', description: 'Investment goals and tolerance.' },
      { id: 'preferences', title: 'Account Preferences', description: 'Settings and compliance.' }
    ],
    fields: [
      // Personal Info
      { name: 'firstName', label: 'First Name', type: 'text', sectionId: 'personal', width: 'half', placeholder: 'e.g. Jane', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', sectionId: 'personal', width: 'half', placeholder: 'e.g. Doe', required: true },
      { name: 'email', label: 'Email Address', type: 'email', sectionId: 'personal', width: 'half', placeholder: 'jane@company.com', required: true },
      { name: 'phone', label: 'Phone Number', type: 'text', sectionId: 'personal', width: 'half', placeholder: '+1 (555) 000-0000' },
      { name: 'address', label: 'Street Address', type: 'text', sectionId: 'personal', width: 'full', placeholder: '123 Wall Street', required: true },
      { name: 'city', label: 'City', type: 'text', sectionId: 'personal', width: 'third', required: true },
      { name: 'state', label: 'State', type: 'select', sectionId: 'personal', width: 'third', optionsKey: 'states', required: true },
      { name: 'zip', label: 'Zip Code', type: 'text', sectionId: 'personal', width: 'third', required: true },

      // Financial Profile
      { name: 'employmentStatus', label: 'Employment Status', type: 'select', sectionId: 'financial', width: 'half', optionsKey: 'employmentStatus', required: true },
      { name: 'annualIncome', label: 'Annual Income', type: 'select', sectionId: 'financial', width: 'half', optionsKey: 'annualIncome', required: true },
      { name: 'sourceOfWealth', label: 'Primary Source of Wealth', type: 'text', sectionId: 'financial', width: 'full', placeholder: 'e.g. Salary, Inheritance, Investments' },
      
      // Risk Assessment
      { name: 'riskTolerance', label: 'Risk Tolerance Level', type: 'radio', sectionId: 'risk', width: 'full', optionsKey: 'riskTolerance', description: 'Select the option that best describes the client\'s comfort with market volatility.', required: true },
      { name: 'investmentHorizon', label: 'Investment Horizon (Years)', type: 'number', sectionId: 'risk', width: 'half', placeholder: '10', required: true },
      { name: 'liquidityNeeds', label: 'Liquidity Needs', type: 'select', sectionId: 'risk', width: 'half', optionsKey: 'liquidityNeeds' },

      // Account Preferences
      { name: 'accountType', label: 'Account Type', type: 'select', sectionId: 'preferences', width: 'half', optionsKey: 'accountType', required: true },
      { name: 'currency', label: 'Base Currency', type: 'select', sectionId: 'preferences', width: 'half', optionsKey: 'currency', required: true },
      { name: 'paperless', label: 'Enroll in Paperless Statements', type: 'checkbox', sectionId: 'preferences', width: 'full' },
      { name: 'marginEnabled', label: 'Enable Margin Trading', type: 'checkbox', sectionId: 'preferences', width: 'full', description: 'Subject to credit approval.' },
      { name: 'notes', label: 'Additional Notes / Compliance Remarks', type: 'textarea', sectionId: 'preferences', width: 'full' },
    ]
  };
};

export const fetchReferenceData = async (): Promise<ReferenceData> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading reference data
  return {
    states: [
      { label: 'New York', value: 'NY' }, { label: 'California', value: 'CA' }, { label: 'Texas', value: 'TX' }, { label: 'Florida', value: 'FL' }
    ],
    employmentStatus: [
      { label: 'Employed Full-Time', value: 'full_time' }, { label: 'Self-Employed', value: 'self_employed' }, { label: 'Retired', value: 'retired' }
    ],
    annualIncome: [
      { label: '$0 - $50,000', value: 'tier1' }, { label: '$50,000 - $150,000', value: 'tier2' }, { label: '$150,000+', value: 'tier3' }
    ],
    riskTolerance: [
      { label: 'Conservative (Preservation)', value: 'low' },
      { label: 'Moderate (Growth & Income)', value: 'medium' },
      { label: 'Aggressive (Max Growth)', value: 'high' }
    ],
    liquidityNeeds: [
      { label: 'Low (< 10% needed/yr)', value: 'low' }, { label: 'Moderate', value: 'mod' }, { label: 'High', value: 'high' }
    ],
    accountType: [
      { label: 'Individual Brokerage', value: 'ind' }, { label: 'Joint Tenants', value: 'joint' }, { label: 'IRA', value: 'ira' }, { label: 'Trust', value: 'trust' }
    ],
    currency: [
      { label: 'USD - US Dollar', value: 'usd' }, { label: 'EUR - Euro', value: 'eur' }, { label: 'GBP - British Pound', value: 'gbp' }
    ]
  };
};