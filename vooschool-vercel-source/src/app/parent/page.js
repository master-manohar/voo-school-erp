'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { FiUser, FiCalendar, FiDollarSign, FiCheckSquare, FiBookOpen, FiDownload, FiPhone, FiBell, FiAward } from 'react-icons/fi';
import { formatCurrency, formatDate, getInitials, calcPercentage } from '@/lib/utils';

const DEMO_CHILD = {
  name: 'Aarav Sharma',
  admNo: 'VOO-2024-001',
  class: 'Class 10',
  section: 'A',
  rollNo: 12,
  dob: '2010-05-15',
  bloodGroup: 'B+',
  fatherName: 'Rajesh Sharma',
  motherName: 'Sunita Sharma',
};

const DEMO_ATTENDANCE = {
  present: 198,
  absent: 12,
  total: 210,
  thisMonth: { present: 20, total: 22 },
};

const DEMO_FEES = {
  total: 65000,
  paid: 50000,
  balance: 15000,
};

const DEMO_MARKS = [
  { subject: 'Mathematics', marks: 92, total: 100, grade: 'A+' },
  { subject: 'Science', marks: 85, total: 100, grade: 'A' },
  { subject: 'English', marks: 88, total: 100, grade: 'A+' },
  { subject: 'Hindi', marks: 80, total: 100, grade: 'A' },
  { subject: 'Social Studies', marks: 87, total: 100, grade: 'A' },
];

const DEMO_ANNOUNCEMENTS = [
  { id: 1, title: 'Parent-Teacher Meeting', date: '2025-06-20', text: 'PTM scheduled for Class 10 on June 20th at 10:00 AM.', type: 'info' },
  { id: 2, title: 'Summer Camp Registration', date: '2025-06-18', text: 'Register for summer camp activities. Last date: June 25th.', type: 'info' },
  { id: 3, title: 'Fee Payment Reminder', date: '2025-06-15', text: 'Term 2 fees due by June 30th. Please clear pending dues.', type: 'warning' },
  { id: 4, title: 'Annual Day Celebration', date: '2025-06-10', text: 'Annual Day will be celebrated on July 15th. All parents are invited.', type: 'info' },
];

export default function ParentPortalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    );
  }

  const attendancePercent = calcPercentage(DEMO_ATTENDANCE.present, DEMO_ATTENDANCE.total);
  const feePercent = calcPercentage(DEMO_FEES.paid, DEMO_FEES.total);

  return (
    <div>
      {/* Child Info Card */}
      <div className="section-card" style={{ marginBottom: 'var(--space-lg)', animation: 'fadeInUp 0.4s ease' }}>
        <div className="child-info-card">
          <div className="child-avatar">
            {getInitials(DEMO_CHILD.name)}
          </div>
          <div className="child-details">
            <h3>{DEMO_CHILD.name}</h3>
            <div className="child-details-meta">
              <span><FiUser style={{ fontSize: '13px' }} /> {DEMO_CHILD.admNo}</span>
              <span><FiBookOpen style={{ fontSize: '13px' }} /> {DEMO_CHILD.class} - {DEMO_CHILD.section}</span>
              <span><FiCalendar style={{ fontSize: '13px' }} /> Roll No: {DEMO_CHILD.rollNo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Attendance Card */}
        <div className="section-card dashboard-section" style={{ animationDelay: '0.05s' }}>
          <div className="section-card-header">
            <h3 className="section-card-title">
              <FiCheckSquare style={{ display: 'inline', marginRight: '8px', color: 'var(--success)' }} />
              Attendance
            </h3>
          </div>
          <div className="section-card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            {/* Circular Progress */}
            <div className="circular-progress">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle className="circular-progress-bg" cx="50" cy="50" r="42" />
                <circle
                  className="circular-progress-fill"
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={attendancePercent > 90 ? 'var(--success)' : 'var(--warning)'}
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - attendancePercent / 100)}`}
                />
              </svg>
              <div className="circular-progress-text">{attendancePercent}%</div>
            </div>
            <div>
              <div style={{ marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Overall: </span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{DEMO_ATTENDANCE.present}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {DEMO_ATTENDANCE.total} days</span>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>This Month: </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {DEMO_ATTENDANCE.thisMonth.present}/{DEMO_ATTENDANCE.thisMonth.total}
                </span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Absent: </span>
                <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{DEMO_ATTENDANCE.absent} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Summary Card */}
        <div className="section-card dashboard-section" style={{ animationDelay: '0.1s' }}>
          <div className="section-card-header">
            <h3 className="section-card-title">
              <FiDollarSign style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
              Fees
            </h3>
          </div>
          <div className="section-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Total Fee</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(DEMO_FEES.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Paid</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(DEMO_FEES.paid)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Balance</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(DEMO_FEES.balance)}</span>
            </div>
            <div className="progress-bar" style={{ height: '10px', marginTop: 'var(--space-sm)' }}>
              <div className="progress-bar-fill success" style={{ width: `${feePercent}%` }} />
            </div>
            <p style={{ textAlign: 'right', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>
              {feePercent}% paid
            </p>
          </div>
        </div>
      </div>

      {/* Recent Marks & Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
        {/* Recent Marks */}
        <div className="section-card dashboard-section" style={{ animationDelay: '0.15s' }}>
          <div className="section-card-header">
            <h3 className="section-card-title">
              <FiAward style={{ display: 'inline', marginRight: '8px', color: 'var(--primary)' }} />
              Recent Marks
            </h3>
            <button className="btn btn-ghost btn-sm">
              <FiDownload style={{ fontSize: '13px' }} /> Report Card
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_MARKS.map((mark, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{mark.subject}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{mark.marks}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/{mark.total}</span>
                    </td>
                    <td>
                      <span className={`badge ${mark.grade.includes('+') ? 'badge-success' : 'badge-primary'}`}>
                        {mark.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="section-card dashboard-section" style={{ animationDelay: '0.2s' }}>
          <div className="section-card-header">
            <h3 className="section-card-title">
              <FiBell style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
              Announcements
            </h3>
          </div>
          <div className="section-card-body">
            <div className="activity-list">
              {DEMO_ANNOUNCEMENTS.map((ann) => (
                <div key={ann.id} className="activity-item">
                  <div
                    className="activity-icon"
                    style={{
                      background: ann.type === 'warning' ? 'var(--warning-light)' : 'var(--info-light)',
                      color: ann.type === 'warning' ? 'var(--warning)' : 'var(--info)',
                    }}
                  >
                    <FiBell />
                  </div>
                  <div className="activity-content">
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--font-sm)', marginBottom: '2px' }}>
                      {ann.title}
                    </p>
                    <p className="activity-text">{ann.text}</p>
                    <p className="activity-time">{formatDate(ann.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary">
          <FiDownload /> Download Report Card
        </button>
        <button className="btn btn-secondary">
          <FiDownload /> Download Fee Receipt
        </button>
      </div>
    </div>
  );
}
