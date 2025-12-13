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
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Signup specific
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'WORKER'>('CITIZEN');
  const [department, setDepartment] = useState('');

  const departments = ['PWD', 'Electricity', 'Nagar Nigam', 'Jal Vibhag'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { email, password }
        : { email, password, name, role, department: role === 'WORKER' ? department : undefined };

      if (!isLogin && password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        login(data.token, data.user);
        
        // Redirect based on role
        if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'DEPT_ADMIN') navigate('/admin');
        else if (data.user.role === 'WORKER') navigate('/worker');
        else navigate('/client');
      } else {
        // After signup, switch to login or auto-login
        alert('Account created! Please sign in.');
        setIsLogin(true);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative px-4 text-slate-900">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${authBg})`, opacity: 0.15 }}></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="mt-2 text-slate-600">
            {isLogin ? 'Sign in to access your dashboard.' : 'Create an account to report issues.'}
          </p>
        </div>

        <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-900/5 animate-slide-up">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex w-full grid-cols-2 bg-slate-100 rounded-lg p-1 mb-4">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Sign Up
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                  {error}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div 
                      className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-2 ${role === 'CITIZEN' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setRole('CITIZEN')}
                    >
                      <User className={`h-6 w-6 ${role === 'CITIZEN' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${role === 'CITIZEN' ? 'text-blue-700' : 'text-gray-600'}`}>Citizen</span>
                    </div>
                    <div 
                      className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-2 ${role === 'WORKER' ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setRole('WORKER')}
                    >
                      <HardHat className={`h-6 w-6 ${role === 'WORKER' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${role === 'WORKER' ? 'text-orange-700' : 'text-gray-600'}`}>Worker</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input 
                      placeholder="Full Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  {role === 'WORKER' && (
                    <div className="space-y-2">
                      <select 
                        className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-lg font-semibold mt-4" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
               Admins must be added by developers.
               <br/>
               Super Admin: super@civic.com / admin123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
