import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface Issue {
  issue_id: number;
  issue_type: string;
  severity: string;
  status: string;
  image_url_before: string;
  created_at: string;
  department_assigned: string;
  geo_latitude?: string;
  geo_longitude?: string;
}

export default function ClientDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // api import is needed at top of file
    api.get('/api/issues')
      .then(res => {
        if (Array.isArray(res.data)) {
          setIssues(res.data);
        } else {
          console.error("API returned non-array:", res.data);
          setIssues([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch issues:", err);
        setIssues([]);
      });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Citizen Dashboard</h1>
          <p className="text-slate-500">Track the status of your reported issues.</p>
        </div>
        <Button onClick={() => navigate('/report')} className="bg-primary-600 hover:bg-primary-700">
          <Plus className="mr-2 h-4 w-4" />
          Report New Issue
        </Button>
      </div>

      <div className="space-y-8">
        {/* Active Issues Section */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                <h2 className="text-xl font-semibold text-slate-800">Pending Resolution</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {issues.filter(i => i.status !== 'Resolved').length === 0 ? (
                    <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No pending issues. Great job!</p>
                    </div>
                ) : (
                    issues.filter(i => i.status !== 'Resolved').map((issue) => (
                        <Card key={issue.issue_id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                            {/* ... same card content ... */}
                            {renderIssueCard(issue)}
                        </Card>
                    ))
                )}
            </div>
        </section>

        {/* Resolved Issues Section */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <h2 className="text-xl font-semibold text-slate-800">Resolved History</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {issues.filter(i => i.status === 'Resolved').length === 0 ? (
                    <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No resolved issues yet.</p>
                    </div>
                ) : (
                    issues.filter(i => i.status === 'Resolved').map((issue) => (
                        <Card key={issue.issue_id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500 opacity-90 hover:opacity-100">
                             {renderIssueCard(issue)}
                        </Card>
                    ))
                )}
            </div>
        </section>
      </div>
    </div>
  );
}

// Helper to render card content to avoid duplication
const renderIssueCard = (issue: Issue) => (
    <>
        <div className="aspect-video w-full bg-slate-100 relative">
            <img 
                src={issue.image_url_before.startsWith('http') ? issue.image_url_before : `http://localhost:5000${issue.image_url_before}`} 
                alt={issue.issue_type} 
                className="h-full w-full object-cover" 
            />
            <div className="absolute top-2 right-2">
                <Badge variant={issue.status === 'Resolved' ? 'success' : 'default'}>
                    {issue.status}
                </Badge>
            </div>
        </div>
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900">{issue.issue_type}</h3>
                <span className="text-xs text-slate-500">{new Date(issue.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-slate-500 mb-4">
                <MapPin className="mr-1 h-3 w-3" />
                <span>Lat: {issue.geo_latitude || 'N/A'}, Long: {issue.geo_longitude || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                Dept: {issue.department_assigned}
                </span>
                <span className={`px-2 py-1 rounded font-medium ${
                    issue.severity === 'High' ? 'bg-red-100 text-red-700' : 
                    issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                    'bg-green-100 text-green-700'
                }`}>
                {issue.severity} Priority
                </span>
            </div>
        </CardContent>
    </>
);
