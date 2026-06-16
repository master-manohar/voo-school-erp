'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FiArrowLeft, FiEdit3, FiPhone, FiMail, FiMapPin, FiCalendar, FiDownload } from 'react-icons/fi';
import { formatCurrency, formatDate, getInitials, getStatusColor } from '@/lib/utils';
import { Suspense } from 'react';

const DEMO_STUDENT = {
  admNo: '2021-29',
  name: 'N C SAMVEDA SREE',
  class: 'Grade 3',
  section: 'A',
  rollNo: 1,
  dob: '2017-05-15',
  gender: 'Female',
  bloodGroup: 'B+',
  status: 'Active',
  admissionDate: '2021-06-01',
  fatherName: 'N C Raju',
  fatherMobile: '9876543210',
  fatherEmail: 'ncraju@email.com',
  motherName: 'N C Lakshmi',
  motherMobile: '9876543250',
  address: 'Vanasthalipuram, Hyderabad - 500070',
  feeTotal: 45000,
  feePaid: 30000,
  feeBalance: 15000,
  attendancePresent: 198,
  attendanceTotal: 210,
};

const DEMO_FEE_HISTORY = [
  { date: '2026-04-15', amount: 15000, mode: 'UPI', reference: 'UPI-78234', receipt: 'REC-001' },
  { date: '2026-06-10', amount: 15000, mode: 'Cash', reference: 'CASH', receipt: 'REC-045' },
];

const DEMO_MARKS = [
  { subject: 'Mathematics', term1: 88, term2: 92, grade: 'A+' },
  { subject: 'Science', term1: 82, term2: 85, grade: 'A' },
  { subject: 'English', term1: 90, term2: 88, grade: 'A+' },
  { subject: 'Hindi', term1: 75, term2: 80, grade: 'A' },
  { subject: 'Telugu', term1: 78, term2: 82, grade: 'A' },
];

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const admNo = searchParams.get('id') || '2021-29';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const student = DEMO_STUDENT;
  const attendancePercent = Math.round((student.attendancePresent / student.attendanceTotal) * 100);
  const feePercent = Math.round((student.feePaid / student.feeTotal) * 100);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }} />
        <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: 'var(--space-md)' }}>
        <FiArrowLeft /> Back to Students
      </button>

      {/* Student Info Card */}
      <div className="section-card" style={{ marginBottom: 'var(--space-lg)', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary), #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {getInitials(student.name)}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', marginTop: 'var(--space-xs)' }}>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{student.admNo}</span>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{student.class} - {student.section}</span>
                <span className={`badge ${getStatusColor(student.status)}`}><span className="badge-dot" />{student.status}</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button className="btn btn-secondary btn-sm"><FiDownload style={{ fontSize: '14px' }} /> Report Card</button>
              <button className="btn btn-primary btn-sm"><FiEdit3 style={{ fontSize: '14px' }} /> Edit</button>
            </div>
          )}
        </div>

        {/* Quick Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: 'var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
          {[
            { label: 'Attendance', value: `${attendancePercent}%`, sub: `${student.attendancePresent}/${student.attendanceTotal}`, color: attendancePercent > 90 ? 'var(--success)' : 'var(--warning)' },
            { label: 'Fee Paid', value: formatCurrency(student.feePaid), sub: `of ${formatCurrency(student.feeTotal)}`, color: 'var(--primary)' },
            { label: 'Balance', value: formatCurrency(student.feeBalance), sub: student.feeBalance > 0 ? 'Pending' : 'Clear', color: student.feeBalance > 0 ? 'var(--danger)' : 'var(--success)' },
            { label: 'Roll No', value: `#${student.rollNo}`, sub: student.class, color: 'var(--accent)' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: 'var(--space-md) var(--space-lg)', background: 'var(--bg-base)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="section-card" style={{ animation: 'fadeInUp 0.5s ease both', animationDelay: '0.1s' }}>
        <div className="tabs">
          {['overview', 'fees', 'marks', 'attendance'].map((tab) => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-sm)' }}>Personal Information</h4>
                {[
                  { label: 'Date of Birth', value: formatDate(student.dob) },
                  { label: 'Gender', value: student.gender },
                  { label: 'Blood Group', value: student.bloodGroup },
                  { label: 'Admission Date', value: formatDate(student.admissionDate) },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-sm)' }}>Parent Information</h4>
                {[
                  { label: "Father's Name", value: student.fatherName },
                  { label: "Father's Mobile", value: student.fatherMobile },
                  { label: "Mother's Name", value: student.motherName },
                  { label: "Mother's Mobile", value: student.motherMobile },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ padding: '10px 0' }}>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Address</span>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)', marginTop: '4px' }}>
                    <FiMapPin style={{ display: 'inline', fontSize: '13px', marginRight: '4px' }} />{student.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{formatCurrency(student.feePaid)} paid of {formatCurrency(student.feeTotal)}</span>
                  <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--primary)' }}>{feePercent}%</span>
                </div>
                <div className="progress-bar" style={{ height: '10px' }}><div className="progress-bar-fill" style={{ width: `${feePercent}%` }} /></div>
              </div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>Payment History</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Receipt</th></tr></thead>
                  <tbody>
                    {DEMO_FEE_HISTORY.map((pay, i) => (
                      <tr key={i}>
                        <td>{formatDate(pay.date)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(pay.amount)}</td>
                        <td><span className="badge badge-info">{pay.mode}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>{pay.reference}</td>
                        <td><button className="btn btn-ghost btn-sm"><FiDownload style={{ fontSize: '12px' }} /> {pay.receipt}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'marks' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Term 1</th><th>Term 2</th><th>Grade</th></tr></thead>
                <tbody>
                  {DEMO_MARKS.map((mark, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{mark.subject}</td>
                      <td>{mark.term1}/100</td>
                      <td>{mark.term2}/100</td>
                      <td><span className={`badge ${mark.grade.includes('+') ? 'badge-success' : 'badge-primary'}`}>{mark.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="circular-progress">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle className="circular-progress-bg" cx="50" cy="50" r="42" />
                    <circle className="circular-progress-fill" cx="50" cy="50" r="42"
                      stroke={attendancePercent > 90 ? 'var(--success)' : 'var(--warning)'}
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - attendancePercent / 100)}`}
                    />
                  </svg>
                  <div className="circular-progress-text">{attendancePercent}%</div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--success)' }}>{student.attendancePresent}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Present</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--danger)' }}>{student.attendanceTotal - student.attendancePresent}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Absent</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{student.attendanceTotal}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Working Days</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)' }} />}>
      <StudentProfileContent />
    </Suspense>
  );
}
