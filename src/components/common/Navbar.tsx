import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="border-b border-primary-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sampark Setu" className="h-10 w-auto" />
            <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight">
              Sampark Setu
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/report" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Report Issue
              </Link>
              
              {user ? (
                <>
                  <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'WORKER' ? '/worker' : '/client'} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4">
           <Link to="/" className="block text-slate-600 hover:text-blue-600 font-medium">
             Home
           </Link>
           <Link to="/report" className="block text-slate-600 hover:text-blue-600 font-medium">
             Report Issue
           </Link>
           {user ? (
             <>
               <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'WORKER' ? '/worker' : '/client'} className="block text-slate-600 hover:text-blue-600 font-medium">
                 Dashboard
               </Link>
               <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                 Logout
               </Button>
             </>
           ) : (
             <Link to="/auth" className="block">
               <Button size="sm" className="w-full">Login</Button>
             </Link>
           )}
        </div>
      )}
    </nav>
  );
};
