import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useIssueStore } from '@/store/useIssueStore';
import { BarChart3, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const Dashboard = () => {
  const { issues } = useIssueStore();

  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'RESOLVED').length;
  const pending = issues.filter(i => i.status === 'PENDING').length;
  const inProgress = issues.filter(i => i.status === 'IN_PROGRESS').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of city-wide civic issues and resolution status.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Issues"
          value={total}
          icon={<BarChart3 className="h-4 w-4 text-slate-500" />}
          description="All time reported"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          description="Successfully closed"
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          description="Awaiting action"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          description="Currently being fixed"
        />
        <StatCard
          title="Critical"
          value={issues.filter(i => i.priority === 'HIGH').length}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          description="High priority items"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {issues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{issue.title}</p>
                    <p className="text-sm text-slate-500">
                      {issue.department} • {issue.status}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-slate-500">
                     {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {issues.length === 0 && <p className="text-slate-500">No recent activity.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Department Load</CardTitle>
          </CardHeader>
          <CardContent>
             {/* Placeholder for a chart or heatmap */}
             <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-500">Heatmap / Chart Placeholder</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, description }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-slate-500">{description}</p>
    </CardContent>
  </Card>
);
