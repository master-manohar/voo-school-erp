'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import BuildPromptModal from '@/components/BuildPromptModal';
import { FiCheckSquare, FiUsers, FiCalendar, FiPercent, FiAlertTriangle, FiTool } from 'react-icons/fi';

const DEMO_ATTENDANCE_STATS = {
  totalPresent: 438,
  totalAbsent: 49,
  totalStudents: 487,
  attendanceRate: 89.9,
};

const DEMO_CLASS_ATTENDANCE = [
  { class: 'Class 10A', total: 42, present: 40, absent: 2, percent: 95.2 },
  { class: 'Class 10B', total: 38, present: 35, absent: 3, percent: 92.1 },
  { class: 'Class 9A', total: 40, present: 37, absent: 3, percent: 92.5 },
  { class: 'Class 9B', total: 38, present: 33, absent: 5, percent: 86.8 },
  { class: 'Class 8A', total: 40, present: 38, absent: 2, percent: 95.0 },
  { class: 'Class 8B', total: 36, present: 34, absent: 2, percent: 94.4 },
  { class: 'Class 7A', total: 44, present: 41, absent: 3, percent: 93.2 },
  { class: 'Class 6A', total: 46, present: 40, absent: 6, percent: 87.0 },
  { class: 'Class 6B', total: 42, present: 38, absent: 4, percent: 90.5 },
  { class: 'Class 5A', total: 52, present: 49, absent: 3, percent: 94.2 },
  { class: 'Class 5B', total: 48, present: 44, absent: 4, percent: 91.7 },
  { class: 'Class 4A', total: 50, present: 46, absent: 4, percent: 92.0 },
  { class: 'Class 3A', total: 42, present: 40, absent: 2, percent: 95.2 },
  { class: 'Class 2A', total: 48, present: 43, absent: 5, percent: 89.6 },
  { class: 'Class 1A', total: 45, present: 40, absent: 5, percent: 88.9 },
];

const DEMO_ABSENTEES = [
  { admNo: 'VOO-2024-007', name: 'Farhan Khan', class: 'Class 7A', daysAbsent: 5, lastAbsent: '2025-06-14', phone: '9876543216' },
  { admNo: 'VOO-2024-015', name: 'Neha Joshi', class: 'Class 2A', daysAbsent: 4, lastAbsent: '2025-06-14', phone: '9876543224' },
  { admNo: 'VOO-2024-009', name: 'Harsh Verma', class: 'Class 6A', daysAbsent: 3, lastAbsent: '2025-06-13', phone: '9876543218' },
  { admNo: 'VOO-2024-012', name: 'Kavya Sri', class: 'Class 5B', daysAbsent: 3, lastAbsent: '2025-06-14', phone: '9876543221' },
  { admNo: 'VOO-2024-005', name: 'Devansh Gupta', class: 'Class 8A', daysAbsent: 2, lastAbsent: '2025-06-12', phone: '9876543214' },
];

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('today');
  const [buildPrompt, setBuildPrompt] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-lg)' }} />
      </div>
    );
  }

  const classColumns = [
    { key: 'class', label: 'Class', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
    { key: 'total', label: 'Total' },
    { key: 'present', label: 'Present', render: (val) => <span style={{ color: 'var(--success)', fontWeight: 600 }}>{val}</span> },
    { key: 'absent', label: 'Absent', render: (val) => <span style={{ color: val > 3 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>{val}</span> },
    {
      key: 'percent',
      label: 'Rate',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="progress-bar" style={{ width: '60px' }}>
            <div
              className={`progress-bar-fill ${val >= 95 ? 'success' : val >= 85 ? 'accent' : 'danger'}`}
              style={{ width: `${val}%` }}
            />
          </div>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-xs)', color: val >= 90 ? 'var(--success)' : val >= 85 ? 'var(--accent)' : 'var(--danger)' }}>
            {val}%
          </span>
        </div>
      ),
    },
  ];

  const absenteeColumns = [
    {
      key: 'name',
      label: 'Student',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{row.admNo} • {row.class}</div>
        </div>
      ),
    },
    {
      key: 'daysAbsent',
      label: 'Days Absent',
      render: (val) => (
        <span className={`badge ${val >= 5 ? 'badge-danger' : val >= 3 ? 'badge-warning' : 'badge-info'}`}>
          {val} days
        </span>
      ),
    },
    { key: 'phone', label: 'Parent Mobile' },
    { key: 'lastAbsent', label: 'Last Absent' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Attendance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Track and manage student attendance
          </p>
        </div>
        <div className="page-header-actions">
          <div className="form-group">
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '180px' }}
            />
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => setBuildPrompt({ title: 'Attendance Module', prompt: 'Prompt: Build a daily attendance grid fetching real-time data from MySQL. Include toggles for Present/Absent/Late and a submit button that updates the database. Trigger SMS/WhatsApp notifications to parents of absent students.' })}>
            <FiTool style={{ fontSize: '14px' }} />
            Build Feature
          </button>
          <button className="btn btn-primary btn-sm">
            <FiCheckSquare style={{ fontSize: '14px' }} />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard
          icon={<FiUsers />}
          title="Total Students"
          value={DEMO_ATTENDANCE_STATS.totalStudents}
          accent="primary"
        />
        <StatsCard
          icon={<FiCheckSquare />}
          title="Present Today"
          value={DEMO_ATTENDANCE_STATS.totalPresent}
          accent="success"
        />
        <StatsCard
          icon={<FiAlertTriangle />}
          title="Absent Today"
          value={DEMO_ATTENDANCE_STATS.totalAbsent}
          accent="danger"
        />
        <StatsCard
          icon={<FiPercent />}
          title="Attendance Rate"
          value={`${DEMO_ATTENDANCE_STATS.attendanceRate}%`}
          accent="accent"
        />
      </div>

      {/* Tabs */}
      <div className="section-card">
        <div className="tabs">
          <button className={`tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
            Class-wise ({selectedDate})
          </button>
          <button className={`tab ${activeTab === 'absentees' ? 'active' : ''}`} onClick={() => setActiveTab('absentees')}>
            Frequent Absentees
          </button>
        </div>

        {activeTab === 'today' && (
          <DataTable
            columns={classColumns}
            data={DEMO_CLASS_ATTENDANCE}
            searchable={false}
            pageSize={20}
          />
        )}

        {activeTab === 'absentees' && (
          <DataTable
            columns={absenteeColumns}
            data={DEMO_ABSENTEES}
            searchPlaceholder="Search student..."
          />
        )}
      </div>

      <BuildPromptModal 
        isOpen={!!buildPrompt} 
        onClose={() => setBuildPrompt(null)} 
        title={buildPrompt?.title} 
        prompt={buildPrompt?.prompt} 
      />
    </div>
  );
}
