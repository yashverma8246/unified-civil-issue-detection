import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, User, HardHat, Shield } from 'lucide-react';
import authBg from '@/assets/auth-bg.png';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Default redirect is client dashboard, but if we came from somewhere (e.g. report issue), go back there
  // However, for simplicity and user request, we might just want to direct to dashboard based on role.
  // We'll stick to role-based default for now unless a specific flow requires otherwise.

  const handleLogin = (role: 'CITIZEN' | 'WORKER' | 'ADMIN', redirectPath: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        login(role);
        navigate(redirectPath);
        setLoading(false);
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, any login works as Citizen
    handleLogin('CITIZEN', '/client');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative px-4 text-slate-900">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${authBg})`, opacity: 0.15 }}></div>
      <div className="relative z-10 w-full max-w-md">
      <div className="mb-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
           <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
        <p className="mt-2 text-slate-600">Sign in to report issues or access your dashboard.</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-900/5 animate-slide-up">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
                <Input 
                   type="email" 
                   placeholder="name@example.com" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="h-11"
                />
            </div>
            <div className="space-y-2">
                <Input 
                   type="password" 
                   placeholder="Enter your password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="h-11"
                />
            </div>
            <Button type="submit" className="w-full h-11 text-lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or try demo accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2 hover:bg-blue-50 border-slate-200" onClick={() => handleLogin('CITIZEN', '/client')}>
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-semibold">Citizen</span>
             </Button>
             <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2 hover:bg-orange-50 border-slate-200" onClick={() => handleLogin('WORKER', '/worker')}>
                <HardHat className="h-5 w-5 text-orange-600" />
                <span className="text-xs font-semibold">Worker</span>
             </Button>
             <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2 hover:bg-slate-100 border-slate-200" onClick={() => handleLogin('ADMIN', '/admin')}>
                <Shield className="h-5 w-5 text-slate-700" />
                <span className="text-xs font-semibold">Admin</span>
             </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
