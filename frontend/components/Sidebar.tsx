import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, User, FileText } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Conversions', href: '/dashboard/conversions', icon: FileText, subItems: [
    { name: 'Upload', href: '/dashboard/conversions/upload' },
    { name: 'History', href: '/dashboard/conversions/history' },
    { name: 'Results', href: '/dashboard/conversions/results' },
  ] },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-gray-900 text-white p-4 flex flex-col space-y-4">
      <nav className="space-y-2">
        {navItems.map(({ name, href, icon: Icon, subItems }) => (
          <div key={name}>
            <Link href={href} className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-800'
            )}>
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </Link>
            {subItems && (
              <div className="ml-6 space-y-1">
                {subItems.map(({ name, href }) => (
                  <Link key={name} href={href} className="block p-2 text-sm text-gray-400 hover:text-white">
                    {name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
