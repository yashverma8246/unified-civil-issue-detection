import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BarChart as BarChartIcon, AlertCircle, CheckCircle, PieChart, TrendingUp, Map } from 'lucide-react';

interface Stats {
  total: number;
  resolved: number;
  open: number;
  highPriority: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, resolved: 0, open: 0, highPriority: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/issues')
      .then(res => res.json())
      .then(data => {
        const total = data.length;
        const resolved = data.filter((i: any) => i.status === 'Resolved').length;
        const highPriority = data.filter((i: any) => i.severity === 'High').length;
        setStats({
          total,
          resolved,
          open: total - resolved,
          highPriority
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">City Health Dashboard</h1>
        <p className="text-slate-500">Overview of civic issues, resolution rates, and department performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Issues</CardTitle>
            <BarChartIcon className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+20.1%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.resolved}</div>
            <div className="flex items-center mt-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total * 100) : 0}%` }}></div>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">{(stats.total > 0 ? (stats.resolved / stats.total * 100).toFixed(1) : 0)}% resolution rate</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.open}</div>
            <p className="text-xs text-slate-500 mt-1">Active attention needed</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">High Severity</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.highPriority}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium text-red-600">Requires immediate action</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-0 shadow-lg ring-1 ring-slate-900/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-slate-400" />
                Issue Heatmap
            </CardTitle>
            <CardDescription>Geographic distribution of reported issues across zones.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="h-[400px] w-full bg-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/5 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"></div>
                
                {/* Simulated Heatmap Points */}
                <div className="absolute top-1/2 left-1/3 h-24 w-24 bg-red-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-1/3 left-1/2 h-32 w-32 bg-orange-500/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/3 right-1/4 h-20 w-20 bg-amber-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <Badge variant="outline" className="bg-white/80 backdrop-blur shadow-sm">
                        Live Geospatial Data Visualization
                     </Badge>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-0 shadow-lg ring-1 ring-slate-900/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-slate-400" />
                Department Performance
            </CardTitle>
            <CardDescription>SLA Compliance & Efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
               {[
                   { name: 'Public Works (PWD)', score: 92, color: 'bg-emerald-500' },
                   { name: 'Sanitation / Nagar Nigam', score: 78, color: 'bg-primary-500' },
                   { name: 'Water (PHED)', score: 65, color: 'bg-amber-500' },
                   { name: 'Electricity Board', score: 88, color: 'bg-primary-500' }
               ].map(dept => (
                 <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{dept.name}</span>
                        <span className="font-bold text-slate-900">{dept.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${dept.color} transition-all duration-1000 ease-out`} style={{ width: `${dept.score}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="rounded-lg bg-slate-50 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">System Status</h4>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-medium text-slate-700">AI Classification Nodes Online</span>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
