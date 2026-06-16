'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import { getInitials, getAcademicYear } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function Header({ title, subtitle, onMenuClick }) {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState(getAcademicYear());
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <FiMenu />
        </button>
        <div>
          <h1 className="header-title">{title || 'Dashboard'}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <form className="header-search" onSubmit={handleSearch}>
          <FiSearch className="header-search-icon" />
          <input
            type="text"
            placeholder="Search students, fees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Academic Year */}
        <select
          className="header-year-select"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        >
          <option value="2025-26">2025-26</option>
          <option value="2024-25">2024-25</option>
          <option value="2023-24">2023-24</option>
        </select>

        {/* Notifications */}
        <button className="header-notification" aria-label="Notifications">
          <FiBell />
          <span className="notification-badge">5</span>
        </button>

        {/* Avatar & Dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <div
            className="header-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
            role="button"
            tabIndex={0}
            aria-label="User menu"
          >
            {getInitials(user?.name || 'Admin')}
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                  {user?.name || 'Admin User'}
                </div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {role || 'admin'}
                </div>
              </div>
              <div className="dropdown-item" onClick={() => { setShowDropdown(false); router.push('/dashboard'); }}>
                <FiUser style={{ fontSize: '16px' }} />
                <span>Profile</span>
              </div>
              <div className="dropdown-item" onClick={() => { setShowDropdown(false); router.push('/settings'); }}>
                <FiSettings style={{ fontSize: '16px' }} />
                <span>Settings</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                <FiLogOut style={{ fontSize: '16px' }} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
