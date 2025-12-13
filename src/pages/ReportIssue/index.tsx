import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, Loader2, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import reportBg from '@/assets/report-bg.png';

export const ReportIssue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) {
      return <Navigate to="/auth" replace />;
  }

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for form and analysis
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, long: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                });
                setGettingLocation(false);
            },
            (error) => {
                console.error("Error getting location: ", error);
                alert("Unable to retrieve your location.");
                setGettingLocation(false);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        setGettingLocation(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Auto-analyze on upload (optional, or wait for submit)
      // For better UX, let's analyze immediately to fill details
      await analyzeImage(file);
    }
  };

  const analyzeImage = async (_file: File) => {
    setUploading(true);
    // We'll use the report_issue endpoint which saves immediately for now
    // Ideally we'd have a separate analyze endpoint, but let's just create the issue
    // and then update it or just show the result.
    // SHORTCUT: Just submitting the form creates the issue. 
    // If we want to show analysis BEFORE submitting, we need a separate endpoint.
    // For this prototype, let's just make the "Submit Report" do the work.
    // But the user asked for "take details from client".
    // Let's allow manual input, then submit everything.
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
        alert("Please upload a photo of the issue.");
        return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('image', selectedFile);
    // Use logged in user ID or fallback
    data.append('reporter_id', user?.id || 'anonymous_citizen');
    if (location) {
        data.append('geo_latitude', location.lat.toString());
        data.append('geo_longitude', location.long.toString());
    }
    
    // We can also send the manual description to override/append to AI description
    data.append('description', formData.description); 
    
    try {
        const response = await fetch('http://localhost:5000/api/report_issue', {
            method: 'POST',
            body: data
        });
        const result = await response.json();
        
        if (result.success) {
            setAiAnalysis(result.analysis);
            // Wait a moment then redirect
            setTimeout(() => {
                navigate('/client');
            }, 2000);
        } else {
            alert("Report failed: " + result.error);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to connect to server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-repeat opacity-40 z-0" style={{ backgroundImage: `url(${reportBg})`, backgroundSize: '400px' }} />
      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Report an Issue</h1>
            <p className="mt-2 text-slate-600 bg-white/80 p-2 rounded-md inline-block backdrop-blur-sm">
              Submit a new grievance. Our AI will analyze the photo to automatically detect the issue type and route it.
            </p>
          </div>

          <Card className="border-primary-100 shadow-lg">
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
              <CardDescription>Upload a photo to start.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Area */}
                <div 
                  className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${previewUrl ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  {previewUrl ? (
                      <div className="relative">
                          <img src={previewUrl} alt="Preview" className="mx-auto h-64 object-contain rounded-md" />
                          <Button 
                              type="button" 
                              variant="secondary" 
                              size="sm" 
                              className="absolute top-2 right-2"
                              onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                          >
                              Change
                          </Button>
                      </div>
                  ) : (
                      <>
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                          <Camera className="h-6 w-6" />
                          </div>
                          <h3 className="mb-1 font-medium text-slate-900">Upload Photo</h3>
                          <p className="mb-4 text-sm text-slate-500">Take a photo or upload from gallery</p>
                          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Select Image
                          </Button>
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileSelect}
                          />
                      </>
                  )}
                </div>

                {/* Location Section */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${location ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                          <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                          <h3 className="text-sm font-medium text-slate-900">Incident Location</h3>
                          <p className="text-xs text-slate-500">
                              {location 
                                  ? `${location.lat.toFixed(6)}, ${location.long.toFixed(6)}` 
                                  : "Add location for faster resolution"}
                          </p>
                      </div>
                   </div>
                   <Button 
                      type="button" 
                      variant={location ? "secondary" : "outline"} 
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                   >
                      {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : location ? "Update" : "Get Location"}
                   </Button>
                </div>

                {aiAnalysis && (
                  <div className="rounded-md bg-green-50 p-4 border border-green-200">
                      <div className="flex items-start">
                          <div className="flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Report Submitted Successfully!</h3>
                              <div className="mt-2 text-sm text-green-700">
                                  <p><strong>Detected Type:</strong> {aiAnalysis.issue_type}</p>
                                  <p><strong>Severity:</strong> {aiAnalysis.severity}</p>
                                  <p><strong>Department:</strong> {aiAnalysis.department}</p>
                              </div>
                          </div>
                      </div>
                  </div>
                )}

                <Input
                  label="Issue Title (Optional)"
                  placeholder="e.g., Garbage not collected"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    placeholder="Additional details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || uploading || !selectedFile}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing & Submitting...</> : 'Submit Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
