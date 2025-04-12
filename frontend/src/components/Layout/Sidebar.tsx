// zoku/frontend/components/Layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FileText, BarChart2, MessageCircle, Settings, HelpCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:block w-64 h-screen bg-white shadow-md pt-6">
      <nav className="mt-5 px-2">
        <Link
          href="/invoices"
          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
            isActive('/invoices')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <FileText
            className={`mr-3 h-5 w-5 ${
              isActive('/invoices') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          Invoices
        </Link>

        <Link
          href="/analytics"
          className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${
            isActive('/analytics')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <BarChart2
            className={`mr-3 h-5 w-5 ${
              isActive('/analytics') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          Analytics
        </Link>

        <Link
          href="/chat"
          className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${
            isActive('/chat')
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <MessageCircle
            className={`mr-3 h-5 w-5 ${
              isActive('/chat') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          AI Chat
        </Link>
      </nav>

      <div className="px-2 mt-10">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Settings
        </h3>
        <div className="mt-2">
          <Link
            href="/settings"
            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
              isActive('/settings')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings
              className={`mr-3 h-5 w-5 ${
                isActive('/settings') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Settings
          </Link>

          <Link
            href="/help"
            className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${
              isActive('/help')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <HelpCircle
              className={`mr-3 h-5 w-5 ${
                isActive('/help') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Help & Support
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
