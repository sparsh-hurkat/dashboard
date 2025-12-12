import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ChartData, KPIMetric } from '../types';
import { Activity, DollarSign, Users, TrendingUp, Zap } from 'lucide-react';

interface DashboardOverviewProps {
  chartData: ChartData[];
}

const KPICard = ({ metric, icon: Icon }: { metric: KPIMetric; icon: any }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</h3>
      </div>
      <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'} font-bold`}>
        {metric.change}
      </span>
      <span className="text-slate-500 ml-2">vs last month</span>
    </div>
  </div>
);

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ chartData }) => {
  const kpis: KPIMetric[] = [
    { label: 'Total Revenue', value: '$4,231,890', change: '+12.5%', trend: 'up' },
    { label: 'Active Users', value: '45,231', change: '+8.2%', trend: 'up' },
    { label: 'Bounce Rate', value: '42.3%', change: '-2.1%', trend: 'up' }, // up is good here contextually for styling green
    { label: 'Avg. Order Value', value: '$134.50', change: '+4.3%', trend: 'up' },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Technical Insight Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-lg shrink-0">
            <Zap className="text-yellow-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Executive Analytics Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">Purpose</strong>
                Provides C-Suite executives with an immediate, high-level view of organizational health through aggregated metrics.
              </div>
              <div>
                <strong className="text-white block mb-1">High-Volume Handling</strong>
                Aggregates millions of raw data points into simplified visualizations using hardware-accelerated rendering, ensuring 60fps performance even during real-time updates.
              </div>
              <div>
                <strong className="text-white block mb-1">Business Value</strong>
                Eliminates the wait for end-of-day batch reports, empowering stakeholders to make data-driven decisions instantly.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard metric={kpis[0]} icon={DollarSign} />
        <KPICard metric={kpis[1]} icon={Users} />
        <KPICard metric={kpis[2]} icon={Activity} />
        <KPICard metric={kpis[3]} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">User Acquisition</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="value" name="New Users" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};