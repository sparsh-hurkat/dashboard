import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Transaction, SortState } from '../types';
import { Loader2, ArrowUp, ArrowDown, Database, Server } from 'lucide-react';

interface VirtualTableProps {
  data: Transaction[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  sort: SortState | null;
  onSort: (key: keyof Transaction) => void;
}

export const VirtualTable: React.FC<VirtualTableProps> = ({ 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage, 
  isLoading,
  sort,
  onSort
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? data.length + 1 : data.length, // Add 1 for the loading spinner row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  // Infinite Scroll Trigger
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= data.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    data.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = '';
    switch (status) {
      case 'Completed': colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'; break;
      case 'Pending': colorClass = 'bg-amber-100 text-amber-800 border-amber-200'; break;
      case 'Failed': colorClass = 'bg-red-100 text-red-800 border-red-200'; break;
      case 'Refunded': colorClass = 'bg-purple-100 text-purple-800 border-purple-200'; break;
      default: colorClass = 'bg-slate-100 text-slate-800';
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {status}
      </span>
    );
  };

  const renderSortIcon = (key: keyof Transaction) => {
    if (sort?.key !== key) return <span className="w-4 h-4 inline-block opacity-0 group-hover:opacity-30 transition-opacity">•</span>;
    return sort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg m-6">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
        <p className="text-slate-500 text-sm">Loading initial data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-6 space-y-4">
      {/* Technical Insight Card */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-6 text-white shadow-lg shrink-0">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-lg shrink-0">
            <Database className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">High-Performance Transaction Grid</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-50 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">Purpose</strong>
                Managing massive historical datasets, such as financial ledgers or audit logs, without compromising user experience.
              </div>
              <div>
                <strong className="text-white block mb-1">UI Virtualization</strong>
                Uses "Windowing" to render only visible rows. This demo loads <strong>50,000+ records</strong> seamlessly, maintaining 60fps scrolling where traditional tables would crash the browser.
              </div>
              <div>
                <strong className="text-white block mb-1">Business Value</strong>
                Eliminates pagination fatigue, allowing auditors and analysts to search and sort entire datasets instantly.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
             <Server size={18} className="text-slate-400" />
             <h3 className="text-lg font-bold text-slate-800">Transaction Database</h3>
             {isFetchingNextPage && <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />}
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {data.length.toLocaleString()} rows loaded
          </span>
        </div>
        
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
          {['id', 'customerName', 'email', 'amount', 'status', 'date'].map((key) => (
            <div 
              key={key}
              className={`cursor-pointer hover:text-primary-600 transition-colors flex items-center gap-1 group ${key === 'email' ? 'col-span-2' : ''}`} 
              onClick={() => onSort(key as keyof Transaction)}
            >
              {key.replace(/([A-Z])/g, ' $1').trim()} {renderSortIcon(key as keyof Transaction)}
            </div>
          ))}
        </div>

        {/* Virtual List */}
        <div 
          ref={parentRef} 
          className="flex-1 overflow-auto bg-white"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > data.length - 1;
              const row = data[virtualRow.index];

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`grid grid-cols-7 gap-4 px-6 items-center text-sm border-b border-slate-100 ${
                    isLoaderRow ? 'bg-slate-50' : 'hover:bg-slate-50 transition-colors'
                  } ${virtualRow.index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  {isLoaderRow ? (
                     <div className="col-span-7 flex justify-center items-center text-slate-400 italic">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Fetching more records...
                     </div>
                  ) : (
                    <>
                      <div className="font-mono text-slate-500 font-medium">{row.id}</div>
                      <div className="text-slate-900 font-medium truncate">{row.customerName}</div>
                      <div className="text-slate-500 truncate col-span-2">{row.email}</div>
                      <div className="text-slate-900 font-bold">${row.amount.toFixed(2)}</div>
                      <div><StatusBadge status={row.status} /></div>
                      <div className="text-slate-500">{row.date}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};