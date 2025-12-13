import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Camera, MapPin, Shield } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="container relative mx-auto px-4 text-center animate-fade-in">
          <Badge variant="outline" className="mb-6 border-slate-700 text-slate-300 backdrop-blur-sm self-center">
            Official Civic Platform
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Report. Track. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
              Resolve Together.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300 leading-relaxed">
            The unified interface for citizens and government. Leveraging AI to detect issues and ensure rapid resolution for better, cleaner cities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
             <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-lg px-10 h-14">
                   Launch Dashboard
                </Button>
             </Link>
             <Link to="/report">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-slate-600 hover:bg-slate-800 text-lg px-10 h-14">
                   Report Issue Now
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Stats Section (Mock) */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
             <div className="space-y-2">
                <h3 className="text-4xl font-bold text-slate-900">2.5k+</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Issues Solved</p>
             </div>
             <div className="space-y-2">
                <h3 className="text-4xl font-bold text-slate-900">48h</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg. Resolution</p>
             </div>
             <div className="space-y-2">
                <h3 className="text-4xl font-bold text-slate-900">98%</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Satisfaction</p>
             </div>
             <div className="space-y-2">
                <h3 className="text-4xl font-bold text-slate-900">12</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Patner Cities</p>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Advanced Technology for Public Good</h2>
            <p className="mt-4 text-lg text-slate-600">Built on modern architecture to serve the people efficiently.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Camera className="h-10 w-10 text-primary-500" />}
              title="AI Visual Recognition"
              description="Automatically detects issue type (pothole, garbage, breakage) and severity from a single photo."
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-emerald-500" />}
              title="Geospatial Routing"
              description="Instantly dispatches duties to the nearest field worker based on precise GPS coordinates."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-indigo-500" />}
              title="Transparent Governance"
              description="Immutable records of every report, action, and resolution. Accountability built-in."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Internal sub-component for this page
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="border-0 shadow-md hover:shadow-xl bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2">
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
      {icon}
    </div>
    <h3 className="mb-3 text-2xl font-bold text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </Card>
);
