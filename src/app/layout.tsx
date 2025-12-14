import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
// import { Toaster } from 'react-hot-toast'; // or similar if used

import { ChatAssistant } from '@/components/common/ChatAssistant';

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <ChatAssistant />
      <Footer />
      {/* <Toaster /> */}
    </div>
  );
};
