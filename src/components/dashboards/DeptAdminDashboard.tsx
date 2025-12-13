import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, CheckCircle2 } from 'lucide-react';

export default function DeptAdminDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null); // For modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesRes, workersRes] = await Promise.all([
        api.get('/api/issues'),
        api.get('/api/workers')
      ]);
      setIssues(issuesRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (issueId: number, workerEmail: string) => {
    if (!workerEmail) return;
    try {
      await api.post('/api/issues/assign', { issueId, workerEmail });
      // Update local state
      setIssues(issues.map(i => i.issue_id === issueId ? { ...i, status: 'In Progress', assigned_worker_id: workerEmail } : i));
      setSelectedIssue(null);
    } catch (error) {
      alert('Failed to assign worker');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900">{user?.department} Dashboard</h1>
        <p className="text-slate-600">Manage reported issues and assign workers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                  <Users className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{issues.length}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{issues.filter(i => i.status === 'Resolved').length}</div>
              </CardContent>
          </Card>
      </div>

      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Department Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Worker</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.issue_id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{issue.issue_type}</td>
                    <td className="px-6 py-4">
                      <Badge variant={issue.severity === 'High' ? 'destructive' : 'default'}>
                        {issue.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{issue.status}</td>
                    <td className="px-6 py-4">
                        {issue.assigned_worker_id || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      {issue.status !== 'Resolved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          Assign
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Simple Modal for Assignment */}
      {selectedIssue && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-4">Assign Worker</h3>
                  <p className="mb-4 text-sm text-slate-600">Select a worker for {selectedIssue.issue_type}</p>
                  
                  <div className="space-y-2 mb-4">
                      {workers.map(worker => (
                          <div 
                              key={worker.user_id} 
                              className="p-2 border rounded hover:bg-slate-50 cursor-pointer flex justify-between"
                              onClick={() => handleAssign(selectedIssue.issue_id, worker.email)}
                          >
                              <span className="font-medium text-sm">{worker.name}</span>
                              <span className="text-xs text-slate-400">{worker.email}</span>
                          </div>
                      ))}
                      {workers.length === 0 && <p className="text-sm text-slate-500">No workers found.</p>}
                  </div>
                  
                  <Button variant="ghost" className="w-full" onClick={() => setSelectedIssue(null)}>Cancel</Button>
              </div>
          </div>
      )}
    </div>
  );
}
