'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import BuildPromptModal from '@/components/BuildPromptModal';
import { FiUsers, FiUserCheck, FiDollarSign, FiAlertTriangle, FiPlus, FiSend, FiFileText, FiDownload, FiCheckSquare, FiCalendar, FiTrendingUp, FiClock, FiBookOpen, FiTool } from 'react-icons/fi';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Demo data for the dashboard
const DEMO_STATS = {
  totalStudents: 487,
  activeStudents: 462,
  feeCollected: 2845000,
  pendingDues: 655000,
  attendanceRate: 94.2,
  studentsTrend: 5.2,
  feeTrend: 12.8,
  pendingTrend: -3.4,
};

const DEMO_FEE_CHART = [
  { month: 'Jul', value: 320000 },
  { month: 'Aug', value: 410000 },
  { month: 'Sep', value: 380000 },
  { month: 'Oct', value: 450000 },
  { month: 'Nov', value: 390000 },
  { month: 'Dec', value: 520000 },
  { month: 'Jan', value: 375000 },
];

const DEMO_ACTIVITIES = [
  { id: 1, text: '<strong>Ravi Kumar</strong> paid ₹15,000 — Class 10 fee', time: new Date(Date.now() - 1000 * 60 * 15), type: 'fee', icon: FiDollarSign, color: 'var(--success-light)', iconColor: 'var(--success)' },
  { id: 2, text: '<strong>Class 8A</strong> attendance marked — 38/40 present', time: new Date(Date.now() - 1000 * 60 * 45), type: 'attendance', icon: FiCheckSquare, color: 'var(--info-light)', iconColor: 'var(--info)' },
  { id: 3, text: '<strong>New admission:</strong> Priya Sharma — Class 5B', time: new Date(Date.now() - 1000 * 60 * 120), type: 'student', icon: FiUsers, color: 'var(--primary-light)', iconColor: 'var(--primary)' },
  { id: 4, text: 'Fee reminder sent to <strong>24 parents</strong> via WhatsApp', time: new Date(Date.now() - 1000 * 60 * 180), type: 'communication', icon: FiSend, color: 'var(--accent-light)', iconColor: 'var(--accent)' },
  { id: 5, text: '<strong>Amit Patel</strong> — pending dues ₹8,500 overdue', time: new Date(Date.now() - 1000 * 60 * 300), type: 'alert', icon: FiAlertTriangle, color: 'var(--danger-light)', iconColor: 'var(--danger)' },
];

const DEMO_CLASS_DATA = [
  { class: 'Class 1', students: 45, present: 43, feeCollected: 85 },
  { class: 'Class 2', students: 48, present: 46, feeCollected: 78 },
  { class: 'Class 3', students: 42, present: 40, feeCollected: 92 },
  { class: 'Class 4', students: 50, present: 47, feeCollected: 88 },
  { class: 'Class 5', students: 52, present: 48, feeCollected: 75 },
  { class: 'Class 6', students: 46, present: 44, feeCollected: 82 },
  { class: 'Class 7', students: 44, present: 41, feeCollected: 90 },
  { class: 'Class 8', students: 40, present: 38, feeCollected: 95 },
  { class: 'Class 9', students: 38, present: 36, feeCollected: 70 },
  { class: 'Class 10', students: 42, present: 39, feeCollected: 88 },
];

const DEMO_ALERTS = [
  { type: 'warning', title: 'Fee Deadline Approaching', text: '24 students have pending fees due by June 30th' },
  { type: 'info', title: 'Report Cards', text: 'Term 2 report cards ready for Class 1-5' },
  { type: 'danger', title: 'Low Attendance', text: 'Class 9B attendance dropped to 82% this week' },
];

export default function DashboardPage() {
  const { user, isAdmin, isTeacher, isParent } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [buildPrompt, setBuildPrompt] = useState(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isParent) {
    router.push('/parent');
    return null;
  }

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div className="skeleton" style={{ width: '180px', height: '28px', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <div className="skeleton" style={{ height: '350px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  const maxFee = Math.max(...DEMO_FEE_CHART.map((d) => d.value));

  return (
    <div>
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
            Here&apos;s what&apos;s happening at VOO School today
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-accent btn-sm" onClick={() => setBuildPrompt({ title: 'Dashboard Analytics Module', prompt: 'Prompt: Build the analytics dashboard by aggregating data from the MySQL database. Create endpoints to calculate total fees collected, attendance rates, and student trends. Use a charting library like Recharts or Chart.js for the visual graphs.' })}>
            <FiTool style={{ fontSize: '14px' }} />
            Build Feature
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <StatsCard
          icon={<FiUsers />}
          title="Total Students"
          value={DEMO_STATS.totalStudents}
          trend={DEMO_STATS.studentsTrend}
          trendLabel="vs last year"
          accent="primary"
          onClick={() => router.push('/students')}
        />
        <StatsCard
          icon={<FiUserCheck />}
          title="Active Students"
          value={DEMO_STATS.activeStudents}
          accent="success"
          onClick={() => router.push('/students')}
        />
        <StatsCard
          icon={<FiDollarSign />}
          title="Fee Collected"
          value={formatCurrency(DEMO_STATS.feeCollected)}
          trend={DEMO_STATS.feeTrend}
          trendLabel="this month"
          accent="accent"
          onClick={() => router.push('/fees')}
        />
        <StatsCard
          icon={<FiAlertTriangle />}
          title="Pending Dues"
          value={formatCurrency(DEMO_STATS.pendingDues)}
          trend={DEMO_STATS.pendingTrend}
          trendLabel="vs last month"
          accent="danger"
          onClick={() => router.push('/fees')}
        />
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div>
          {/* Fee Collection Chart */}
          <div className="section-card dashboard-section" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Fee Collection Trend</h3>
              <span className="badge badge-primary">
                <FiTrendingUp style={{ fontSize: '12px' }} />
                This Year
              </span>
            </div>
            <div className="section-card-body">
              <div className="bar-chart">
                {DEMO_FEE_CHART.map((item, i) => (
                  <div key={i} className="bar-chart-bar">
                    <div className="bar-chart-value">{formatCurrency(item.value).replace('₹', '₹')}</div>
                    <div
                      className="bar-chart-fill"
                      style={{
                        height: `${(item.value / maxFee) * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                    <div className="bar-chart-label">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class-wise Data */}
          <div className="section-card dashboard-section">
            <div className="section-card-header">
              <h3 className="section-card-title">Class-wise Overview</h3>
              <button className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Students</th>
                    <th>Present</th>
                    <th>Fee %</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_CLASS_DATA.map((row) => (
                    <tr key={row.class} className="clickable" onClick={() => router.push(`/students?class=${row.class}`)}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.class}</td>
                      <td>{row.students}</td>
                      <td>
                        <span style={{ color: row.present / row.students > 0.9 ? 'var(--success)' : 'var(--warning)' }}>
                          {row.present}/{row.students}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ width: '80px' }}>
                            <div
                              className={`progress-bar-fill ${row.feeCollected >= 90 ? 'success' : row.feeCollected >= 75 ? 'accent' : 'danger'}`}
                              style={{ width: `${row.feeCollected}%` }}
                            />
                          </div>
                          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>{row.feeCollected}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Quick Actions */}
          <div className="section-card dashboard-section" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Quick Actions</h3>
            </div>
            <div className="section-card-body">
              <div className="quick-actions">
                <div className="quick-action-btn" onClick={() => router.push('/students')}>
                  <FiPlus className="quick-action-btn-icon" />
                  <span className="quick-action-btn-label">Add Student</span>
                </div>
                <div className="quick-action-btn" onClick={() => router.push('/fees')}>
                  <FiDollarSign className="quick-action-btn-icon" />
                  <span className="quick-action-btn-label">Record Fee</span>
                </div>
                <div className="quick-action-btn" onClick={() => router.push('/attendance')}>
                  <FiCheckSquare className="quick-action-btn-icon" />
                  <span className="quick-action-btn-label">Attendance</span>
                </div>
                <div className="quick-action-btn">
                  <FiSend className="quick-action-btn-icon" />
                  <span className="quick-action-btn-label">Send Notice</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="section-card dashboard-section" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Alerts</h3>
              <span className="badge badge-danger">{DEMO_ALERTS.length}</span>
            </div>
            <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {DEMO_ALERTS.map((alert, i) => (
                <div key={i} className={`alert alert-${alert.type}`}>
                  <FiAlertTriangle className="alert-icon" />
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-text">{alert.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-card dashboard-section">
            <div className="section-card-header">
              <h3 className="section-card-title">Recent Activity</h3>
              <button className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div className="section-card-body">
              <div className="activity-list">
                {DEMO_ACTIVITIES.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="activity-item">
                      <div
                        className="activity-icon"
                        style={{ background: activity.color, color: activity.iconColor }}
                      >
                        <Icon />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text" dangerouslySetInnerHTML={{ __html: activity.text }} />
                        <p className="activity-time">
                          <FiClock style={{ fontSize: '11px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                          {formatRelativeTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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
