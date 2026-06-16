'use client';

import { FiHome, FiUsers, FiDollarSign, FiMessageSquare, FiMoreHorizontal, FiFileText } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Home', icon: FiHome, path: '/dashboard' },
  { label: 'Enquiries', icon: FiFileText, path: '/enquiries' },
  { label: 'Students', icon: FiUsers, path: '/students' },
  { label: 'Fees', icon: FiDollarSign, path: '/fees' },
  { label: 'Messages', icon: FiMessageSquare, path: '/communication' },
  { label: 'More', icon: FiMoreHorizontal, path: '/settings' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-items">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== '/dashboard' && pathname.startsWith(item.path));

          return (
            <div
              key={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push(item.path)}
            >
              <span className="bottom-nav-item-icon">
                <Icon />
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
