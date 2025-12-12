import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Table, UserPlus, Search, Bell, Menu } from 'lucide-react';
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { TabView, Transaction, SortState } from './types';
import { fetchTransactions, fetchDashboardMetrics } from './services/mockData';
import { VirtualTable } from './components/VirtualTable';
import { DashboardOverview } from './components/DashboardOverview';
import { DynamicForm } from './components/DynamicForm';

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching for demo stability
      staleTime: 1000 * 60 * 5, // 5 mins stale time
    },
  },
});

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>(TabView.OVERVIEW);
  const [sort, setSort] = useState<SortState | null>(null);

  // 1. Fetch Dashboard Metrics (Standard Query)
  const { data: metricsData, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    enabled: activeTab === TabView.OVERVIEW,
  });

  // 2. Fetch Transactions (Infinite Query with Server-Side Sorting)
  const {
    data: transactionData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isTransactionsLoading,
  } = useInfiniteQuery({
    queryKey: ['transactions', sort], // Re-fetch when sort changes
    queryFn: ({ pageParam }) => fetchTransactions({ cursor: pageParam as number, pageSize: 50, sort }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: activeTab === TabView.DATA_GRID, // Only fetch when needed
  });

  // Flatten the pages into a single array for the virtual table
  const flatTransactions = useMemo(() => {
    return transactionData?.pages.flatMap(page => page.data) || [];
  }, [transactionData]);

  const handleSort = (key: keyof Transaction) => {
    setSort(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case TabView.OVERVIEW:
        if (isMetricsLoading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading Analytics...</div>;
        return <DashboardOverview chartData={metricsData?.chartData || []} />;
      
      case TabView.DATA_GRID:
        return (
          <div className="h-[calc(100vh-140px)]">
            <VirtualTable 
              data={flatTransactions}
              fetchNextPage={fetchNextPage}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isTransactionsLoading}
              sort={sort}
              onSort={handleSort}
            />
          </div>
        );
      
      case TabView.CLIENT_ONBOARDING:
        return <DynamicForm />;
      
      default:
        return <div className="text-slate-900 p-6">Section Placeholder</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-sm z-20">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="font-bold text-white text-lg">D</span>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Dashboard</span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            active={activeTab === TabView.OVERVIEW} 
            onClick={() => setActiveTab(TabView.OVERVIEW)} 
          />
          <SidebarItem 
            icon={Table} 
            label="Transactions" 
            active={activeTab === TabView.DATA_GRID} 
            onClick={() => setActiveTab(TabView.DATA_GRID)} 
          />
          <SidebarItem 
            icon={UserPlus} 
            label="Client Onboarding" 
            active={activeTab === TabView.CLIENT_ONBOARDING} 
            onClick={() => setActiveTab(TabView.CLIENT_ONBOARDING)} 
          />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">JD</div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">Senior Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
             <button className="md:hidden p-2 text-slate-500 hover:text-slate-900">
                <Menu size={20} />
             </button>
             <h2 className="text-xl font-bold text-slate-800">
               {activeTab === TabView.OVERVIEW && 'Dashboard Overview'}
               {activeTab === TabView.DATA_GRID && 'Transaction Database'}
               {activeTab === TabView.CLIENT_ONBOARDING && 'New Client Application'}
             </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 scroll-smooth">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default App;