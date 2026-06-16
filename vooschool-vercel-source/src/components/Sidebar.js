'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { FiHome, FiUsers, FiCheckSquare, FiBookOpen, FiDollarSign, FiMessageSquare, FiSettings, FiLogOut, FiChevronLeft } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';

const adminNavItems = [
  { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { label: 'Students', icon: FiUsers, path: '/students' },
  { label: 'Attendance', icon: FiCheckSquare, path: '/attendance' },
  { label: 'Academics', icon: FiBookOpen, path: '/academics' },
  { label: 'Fees', icon: FiDollarSign, path: '/fees' },
  { label: 'Communication', icon: FiMessageSquare, path: '/communication', badge: 3 },
  { label: 'Settings', icon: FiSettings, path: '/settings' },
];

const teacherNavItems = [
  { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { label: 'Students', icon: FiUsers, path: '/students' },
  { label: 'Attendance', icon: FiCheckSquare, path: '/attendance' },
  { label: 'Academics', icon: FiBookOpen, path: '/academics' },
  { label: 'Communication', icon: FiMessageSquare, path: '/communication' },
];

const parentNavItems = [
  { label: 'Dashboard', icon: FiHome, path: '/parent' },
  { label: 'Fees', icon: FiDollarSign, path: '/fees' },
  { label: 'Attendance', icon: FiCheckSquare, path: '/attendance' },
  { label: 'Communication', icon: FiMessageSquare, path: '/communication' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAdmin, isTeacher, isParent, logout } = useAuth();

  let navItems = adminNavItems;
  if (isTeacher) navItems = teacherNavItems;
  if (isParent) navItems = parentNavItems;

  const handleNavClick = (path) => {
    router.push(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">V</div>
          <div className="sidebar-title">
            <h2>VOO School</h2>
            <span>Vidhya • Ojas • Omkara</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/dashboard' && item.path !== '/parent' && pathname.startsWith(item.path));

            return (
              <div
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavClick(item.path)}
              >
                <span className="nav-item-icon">
                  <Icon />
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer — User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="sidebar-user-avatar">
              {getInitials(user?.name || 'User')}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{role || 'admin'}</div>
            </div>
            <FiLogOut style={{ color: 'var(--text-muted)', fontSize: '16px', flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}
