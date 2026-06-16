'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiSend, FiPlus, FiDownload, FiPercent } from 'react-icons/fi';
import { formatCurrency, getStatusColor, calcPercentage } from '@/lib/utils';

const DEMO_FEE_STATS = {
  totalDue: 3500000,
  collected: 2845000,
  pending: 655000,
  collectionPercent: 81.3,
  thisMonthCollected: 320000,
  remindersToSend: 24,
};

const DEMO_CLASS_FEES = [
  { class: 'Class 10', students: 42, totalDue: 420000, collected: 370000, pending: 50000, percent: 88 },
  { class: 'Class 9', students: 38, totalDue: 380000, collected: 305000, pending: 75000, percent: 80 },
  { class: 'Class 8', students: 40, totalDue: 360000, collected: 340000, pending: 20000, percent: 94 },
  { class: 'Class 7', students: 44, totalDue: 352000, collected: 290000, pending: 62000, percent: 82 },
  { class: 'Class 6', students: 46, totalDue: 322000, collected: 280000, pending: 42000, percent: 87 },
  { class: 'Class 5', students: 52, totalDue: 364000, collected: 310000, pending: 54000, percent: 85 },
  { class: 'Class 4', students: 50, totalDue: 300000, collected: 260000, pending: 40000, percent: 87 },
  { class: 'Class 3', students: 42, totalDue: 252000, collected: 235000, pending: 17000, percent: 93 },
  { class: 'Class 2', students: 48, totalDue: 240000, collected: 200000, pending: 40000, percent: 83 },
  { class: 'Class 1', students: 45, totalDue: 225000, collected: 190000, pending: 35000, percent: 84 },
];

const DEMO_PENDING = [
  { admNo: 'VOO-2024-005', name: 'Devansh Gupta', class: 'Class 8', mobile: '9876543214', balance: 22000, dueDate: '2025-06-30', status: 'Overdue' },
  { admNo: 'VOO-2024-013', name: 'Lakshmi Devi', class: 'Class 4', mobile: '9876543222', balance: 18000, dueDate: '2025-06-30', status: 'Pending' },
  { admNo: 'VOO-2024-001', name: 'Aarav Sharma', class: 'Class 10', mobile: '9876543210', balance: 15000, dueDate: '2025-06-30', status: 'Pending' },
  { admNo: 'VOO-2024-009', name: 'Harsh Verma', class: 'Class 6', mobile: '9876543218', balance: 12000, dueDate: '2025-07-15', status: 'Upcoming' },
  { admNo: 'VOO-2024-003', name: 'Bhavya Patel', class: 'Class 9', mobile: '9876543212', balance: 8500, dueDate: '2025-07-15', status: 'Upcoming' },
  { admNo: 'VOO-2024-011', name: 'Jai Prakash', class: 'Class 5', mobile: '9876543220', balance: 7500, dueDate: '2025-06-30', status: 'Pending' },
  { admNo: 'VOO-2024-006', name: 'Eesha Nair', class: 'Class 8', mobile: '9876543215', balance: 5000, dueDate: '2025-07-15', status: 'Upcoming' },
];

export default function FeesPage() {
  const { isAdmin, isParent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
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

  // Parent view
  if (isParent) {
    return (
      <div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-lg)' }}>
          Fee Details
        </h1>
        <div className="section-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Fee</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(65000)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Paid</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(50000)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Balance</span>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(15000)}</span>
          </div>
          <div className="progress-bar" style={{ height: '10px', marginTop: 'var(--space-md)' }}>
            <div className="progress-bar-fill success" style={{ width: '77%' }} />
          </div>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>77% paid</p>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', textAlign: 'center' }}>
          For payment inquiries, please contact the school office.
        </p>
      </div>
    );
  }

  const pendingColumns = [
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
    { key: 'mobile', label: 'Mobile' },
    {
      key: 'balance',
      label: 'Balance',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`badge ${getStatusColor(val)}`}>{val}</span>,
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: () => (
        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setShowPaymentModal(true); }}>
          <FiDollarSign style={{ fontSize: '13px' }} /> Record
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Fee Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Academic Year 2025-26
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-accent btn-sm" onClick={() => setShowReminderModal(true)}>
            <FiSend style={{ fontSize: '14px' }} />
            Send Reminders
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
            <FiPlus style={{ fontSize: '14px' }} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard
          icon={<FiDollarSign />}
          title="Total Due"
          value={formatCurrency(DEMO_FEE_STATS.totalDue)}
          accent="primary"
        />
        <StatsCard
          icon={<FiCheckCircle />}
          title="Collected"
          value={formatCurrency(DEMO_FEE_STATS.collected)}
          trend={12.8}
          trendLabel="this month"
          accent="success"
        />
        <StatsCard
          icon={<FiAlertTriangle />}
          title="Pending"
          value={formatCurrency(DEMO_FEE_STATS.pending)}
          accent="danger"
        />
        <StatsCard
          icon={<FiPercent />}
          title="Collection %"
          value={`${DEMO_FEE_STATS.collectionPercent}%`}
          accent="accent"
        />
      </div>

      {/* Tabs */}
      <div className="section-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="tabs">
          <button className={`tab ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
            Class-wise
          </button>
          <button className={`tab ${activeView === 'pending' ? 'active' : ''}`} onClick={() => setActiveView('pending')}>
            Pending Dues ({DEMO_PENDING.length})
          </button>
        </div>

        {activeView === 'overview' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Total Due</th>
                  <th>Collected</th>
                  <th>Pending</th>
                  <th>Collection %</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_CLASS_FEES.map((row) => (
                  <tr key={row.class}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.class}</td>
                    <td>{row.students}</td>
                    <td>{formatCurrency(row.totalDue)}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(row.collected)}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(row.pending)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '80px' }}>
                          <div
                            className={`progress-bar-fill ${row.percent >= 90 ? 'success' : row.percent >= 80 ? 'accent' : 'danger'}`}
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-xs)' }}>{row.percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'pending' && (
          <div>
            <DataTable
              columns={pendingColumns}
              data={DEMO_PENDING}
              searchPlaceholder="Search student..."
              pageSize={10}
            />
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Fee Payment"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            <button className="btn btn-success" onClick={() => setShowPaymentModal(false)}>
              <FiCheckCircle style={{ fontSize: '14px' }} />
              Record Payment
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Admission Number *</label>
            <input type="text" className="form-input" placeholder="VOO-2024-XXX" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <div className="input-group">
                <span className="input-prefix">₹</span>
                <input type="number" className="form-input" placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select className="form-select">
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Online</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reference / Transaction ID</label>
            <input type="text" className="form-input" placeholder="Transaction reference" />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Optional notes" rows={2} />
          </div>
        </div>
      </Modal>

      {/* Send Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="Send Fee Reminders"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowReminderModal(false)}>Cancel</button>
            <button className="btn btn-accent" onClick={() => setShowReminderModal(false)}>
              <FiSend style={{ fontSize: '14px' }} />
              Send via WhatsApp
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="alert alert-info">
            <FiSend className="alert-icon" />
            <div className="alert-content">
              <div className="alert-title">WhatsApp Fee Reminder</div>
              <div className="alert-text">
                Send fee reminders to {DEMO_PENDING.length} parents with pending dues via WhatsApp.
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Class</label>
            <select className="form-select">
              <option>All Classes with Pending Dues</option>
              <option>Class 10</option>
              <option>Class 9</option>
              <option>Class 8</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Message Template</label>
            <select className="form-select">
              <option>Fee Reminder — Gentle</option>
              <option>Fee Reminder — Urgent</option>
              <option>Fee Reminder — Final Notice</option>
            </select>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '8px' }}>Preview:</p>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Dear Parent, this is a gentle reminder from VOO School that a fee balance of ₹{'{{amount}}'} is pending for {'{{student_name}}'} ({'{'}{'{'} class {'}'}{'}'}). Please clear the dues at the earliest. Thank you! 🙏
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
