import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Package, FolderTree, History, Users, BarChart3, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/categories', icon: FolderTree, label: 'Categories' },
    { path: '/waiters', icon: Users, label: 'Waiters' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Building2, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <span className="ml-2 text-lg md:text-xl font-bold text-foreground">Aruvi Admin</span>
            </div>
            <div className="hidden md:flex space-x-2 lg:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {/* Mobile nav */}
            <div className="flex md:hidden overflow-x-auto gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
};
