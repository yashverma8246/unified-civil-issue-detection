import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Map, MapPin } from 'lucide-react';


interface Task {
  issue_id: number;
  issue_type: string;
  severity: string;
  status: string;
  department_assigned: string;
  image_url_before: string;
  geo_latitude: string;
  geo_longitude: string;
  sla_due_date: string;
}

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock fetch tasks - in real app would filter by assigned worker
  useEffect(() => {
    fetch('http://localhost:5000/api/issues')
      .then(res => res.json())
      .then(data => {
        setTasks(data.filter((i: Task) => i.status !== 'Resolved')); // Show only active
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tasks", err);
        setLoading(false);
      });
  }, []);

  const handleResolveClick = (id: number) => {
    setResolvingId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && resolvingId) {
      const file = e.target.files[0];
      await resolveTask(resolvingId, file);
    }
  };

  const resolveTask = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image_after', file);
    formData.append('issue_id', id.toString());

    try {
      // Optimistic UI update could happen here, but we wait for verification
      const response = await fetch('http://localhost:5000/api/resolve_issue', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.resolved) {
        // Success Toast/Notification would be better, using simple alert for now but cleaner
        // Ideally use a toast library. For now, just update state.
        setTasks(tasks.filter(t => t.issue_id !== id));
      } else {
        alert(`Verification Failed: ${data.message}\nReason: ${data.explanation}`);
      }
    } catch (error) {
      console.error("Error resolving:", error);
      alert("Error submitting resolution.");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="warning" className="mb-2">Field Operations</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Task Queue</h1>
          <p className="text-slate-500">Prioritized tasks based on SLA urgency and location.</p>
        </div>
      </div>

      <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold text-slate-800">Assigned Issues ({tasks.length})</h2>
          </div>
          
          {loading && (
             <div className="p-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500">Loading tasks...</p>
             </div>
          )}
          
          {tasks.length === 0 && !loading && (
             <Card className="p-12 text-center border-dashed border-2 bg-slate-50/50">
                <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                <p className="text-slate-500">No pending issues assigned to you.</p>
             </Card>
          )}
          
          <div className="space-y-4">
            {tasks.map((task) => (
                <Card key={task.issue_id} className="overflow-hidden group hover:border-primary-200 transition-colors">
                <div className="flex flex-col sm:flex-row gap-0">
                    <div className="sm:w-48 h-48 sm:h-auto relative">
                        <img 
                            src={task.image_url_before.startsWith('http') ? task.image_url_before : `http://localhost:5000${task.image_url_before}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            alt="Issue"
                        />
                        <div className="absolute top-2 left-2">
                            <Badge variant={task.severity === 'High' ? 'destructive' : 'warning'} className="shadow-sm">
                                {task.severity}
                            </Badge>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                                    {task.issue_type}
                                </h3>
                                <div className="text-right">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Due By</span>
                                    <p className="text-sm font-semibold text-slate-700">{new Date(task.sla_due_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 flex items-center mb-4">
                                <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                                {task.geo_latitude?.substring(0, 8) || 'N/A'}, {task.geo_longitude?.substring(0, 8) || 'N/A'}
                            </p>
                        </div>
                        
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                            <Button size="sm" onClick={() => handleResolveClick(task.issue_id)} className="flex-1 bg-slate-900 hover:bg-slate-800">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Upload & Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                                <Map className="w-4 h-4 mr-2" />
                                Navigation
                            </Button>
                        </div>
                    </div>
                </div>
                </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <Card className="sticky top-6 border-0 shadow-lg ring-1 ring-slate-900/5 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                 <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-500 flex items-center">
                    <Map className="w-4 h-4 mr-2" /> Live Field Map
                 </CardTitle>
              </CardHeader>
              <div className="h-[400px] w-full bg-slate-100 relative group">
                  {/* Better Map Placeholder with Image */}
                  <div className="absolute inset-0 bg-slate-200 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <div className="text-slate-400 text-center relative z-10">
                            <MapPin className="h-12 w-12 mx-auto mb-2 text-slate-400 animate-bounce" />
                            <p className="font-medium">Interactive Map Module</p>
                            <p className="text-xs text-slate-400">Loading geospatial data...</p>
                        </div>
                  </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
