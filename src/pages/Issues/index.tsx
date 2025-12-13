import { useIssueStore } from '@/store/useIssueStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils';
import { MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export const IssuesPage = () => {
  const { issues, addIssue } = useIssueStore();

  // Populate with dummy data if empty
  useEffect(() => {
    if (issues.length === 0) {
       addIssue({
         id: '101',
         title: 'Pothole on Main Street',
         description: 'Large pothole causing traffic slowdown.',
         status: 'PENDING',
         department: 'ROADS',
         location: { lat: 0, lng: 0, address: 'Main St, Downtown' },
         imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80',
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         userId: '2',
         priority: 'HIGH'
       });
       addIssue({
          id: '102',
          title: 'Street Light Broken',
          description: 'Street light near park entrance is not working.',
          status: 'RESOLVED',
          department: 'ELECTRICITY',
          location: { lat: 0, lng: 0, address: 'Central Park Gate 2' },
          imageUrl: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          userId: '3',
          priority: 'MEDIUM'
        });
    }
  }, [issues.length, addIssue]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Public Issues</h1>
        <p className="text-slate-600">View and track civic issues reported by the community.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => (
          <Card key={issue.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 w-full bg-slate-200 relative">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3">
                 <Badge variant={
                    issue.status === 'RESOLVED' ? 'success' :
                    issue.status === 'IN_PROGRESS' ? 'warning' :
                    'default'
                 }>
                   {issue.status.replace('_', ' ')}
                 </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                {issue.department}
              </div>
              <Link to={`/issues/`} className="group">
                <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {issue.title}
                </h3>
              </Link>
              <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                {issue.description}
              </p>

              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                  <span className="truncate">{issue.location.address}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {issues.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No issues found. Be the first to report one!
          </div>
        )}
      </div>
    </div>
  );
};
