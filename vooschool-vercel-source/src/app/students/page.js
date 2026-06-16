'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import BuildPromptModal from '@/components/BuildPromptModal';
import { FiPlus, FiDownload, FiFilter, FiUserPlus, FiTool } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency, getStatusColor } from '@/lib/utils';

// Demo student data
const DEMO_STUDENTS = [
  { admNo: 'VOO-2024-001', name: 'Aarav Sharma', class: 'Class 10', section: 'A', fatherName: 'Rajesh Sharma', fatherMobile: '9876543210', status: 'Active', feeBalance: 15000 },
  { admNo: 'VOO-2024-002', name: 'Ananya Reddy', class: 'Class 10', section: 'A', fatherName: 'Suresh Reddy', fatherMobile: '9876543211', status: 'Active', feeBalance: 0 },
  { admNo: 'VOO-2024-003', name: 'Bhavya Patel', class: 'Class 9', section: 'B', fatherName: 'Dinesh Patel', fatherMobile: '9876543212', status: 'Active', feeBalance: 8500 },
  { admNo: 'VOO-2024-004', name: 'Charvi Iyer', class: 'Class 9', section: 'A', fatherName: 'Srinivas Iyer', fatherMobile: '9876543213', status: 'Active', feeBalance: 0 },
  { admNo: 'VOO-2024-005', name: 'Devansh Gupta', class: 'Class 8', section: 'A', fatherName: 'Anil Gupta', fatherMobile: '9876543214', status: 'Active', feeBalance: 22000 },
  { admNo: 'VOO-2024-006', name: 'Eesha Nair', class: 'Class 8', section: 'B', fatherName: 'Mohan Nair', fatherMobile: '9876543215', status: 'Active', feeBalance: 5000 },
  { admNo: 'VOO-2024-007', name: 'Farhan Khan', class: 'Class 7', section: 'A', fatherName: 'Irfan Khan', fatherMobile: '9876543216', status: 'Inactive', feeBalance: 35000 },
  { admNo: 'VOO-2024-008', name: 'Gayathri Das', class: 'Class 7', section: 'A', fatherName: 'Pratap Das', fatherMobile: '9876543217', status: 'Active', feeBalance: 0 },
  { admNo: 'VOO-2024-009', name: 'Harsh Verma', class: 'Class 6', section: 'B', fatherName: 'Vijay Verma', fatherMobile: '9876543218', status: 'Active', feeBalance: 12000 },
  { admNo: 'VOO-2024-010', name: 'Isha Mehta', class: 'Class 6', section: 'A', fatherName: 'Rahul Mehta', fatherMobile: '9876543219', status: 'Active', feeBalance: 0 },
  { admNo: 'VOO-2024-011', name: 'Jai Prakash', class: 'Class 5', section: 'A', fatherName: 'Sunil Prakash', fatherMobile: '9876543220', status: 'Active', feeBalance: 7500 },
  { admNo: 'VOO-2024-012', name: 'Kavya Sri', class: 'Class 5', section: 'B', fatherName: 'Raman Sri', fatherMobile: '9876543221', status: 'Active', feeBalance: 0 },
  { admNo: 'VOO-2024-013', name: 'Lakshmi Devi', class: 'Class 4', section: 'A', fatherName: 'Narayana Devi', fatherMobile: '9876543222', status: 'Active', feeBalance: 18000 },
  { admNo: 'VOO-2024-014', name: 'Manav Singh', class: 'Class 3', section: 'A', fatherName: 'Pradeep Singh', fatherMobile: '9876543223', status: 'Active', feeBalance: 0 },
  { admNo: 'VOO-2024-015', name: 'Neha Joshi', class: 'Class 2', section: 'A', fatherName: 'Amit Joshi', fatherMobile: '9876543224', status: 'Pending', feeBalance: 45000 },
];

const CLASS_OPTIONS = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STATUS_OPTIONS = ['All Status', 'Active', 'Inactive', 'Pending'];

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState(searchParams.get('class') || 'All Classes');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [buildPrompt, setBuildPrompt] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStudents(DEMO_STUDENTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (classFilter !== 'All Classes' && s.class !== classFilter) return false;
      if (statusFilter !== 'All Status' && s.status !== statusFilter) return false;
      return true;
    });
  }, [students, classFilter, statusFilter]);

  const columns = [
    {
      key: 'index',
      label: '#',
      width: '50px',
      sortable: false,
      render: (_, __, idx) => (
        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{idx + 1}</span>
      ),
    },
    {
      key: 'admNo',
      label: 'Adm No',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 'var(--font-xs)' }}>{val}</span>
      ),
    },
    {
      key: 'name',
      label: 'Student Name',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: `linear-gradient(135deg, var(--primary), ${row.status === 'Active' ? 'var(--success)' : 'var(--accent)'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {val?.charAt(0)}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
        </div>
      ),
    },
    { key: 'class', label: 'Class' },
    { key: 'fatherMobile', label: 'Father Mobile' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${getStatusColor(val)}`}>
          <span className="badge-dot" />
          {val}
        </span>
      ),
    },
    {
      key: 'feeBalance',
      label: 'Fee Balance',
      render: (val) => (
        <span style={{ fontWeight: 600, color: val > 0 ? 'var(--danger)' : 'var(--success)' }}>
          {val > 0 ? formatCurrency(val) : 'Paid ✓'}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Students
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            {filteredStudents.length} students found
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-accent btn-sm" onClick={() => setBuildPrompt({ title: 'Student Management Module', prompt: 'Prompt: Build a comprehensive CRUD interface for student management. Connect to the MySQL database to perform create, read, update, and delete operations. Include features for bulk importing students via CSV.' })}>
            <FiTool style={{ fontSize: '14px' }} />
            Build Feature
          </button>
          <button className="btn btn-secondary btn-sm">
            <FiDownload style={{ fontSize: '14px' }} />
            Export
          </button>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <FiPlus style={{ fontSize: '14px' }} />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={loading}
        searchPlaceholder="Search by name, adm no, phone..."
        onRowClick={(row) => router.push(`/students/${row.admNo}`)}
        emptyTitle="No students found"
        emptyText="Try adjusting your search or filters"
        filters={
          <>
            <select
              className="form-select"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ maxWidth: '160px' }}
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '140px' }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </>
        }
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        large
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(false)}>
              <FiUserPlus style={{ fontSize: '14px' }} />
              Add Student
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Student Name *</label>
            <input type="text" className="form-input" placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Admission No *</label>
            <input type="text" className="form-input" placeholder="VOO-2024-XXX" />
          </div>
          <div className="form-group">
            <label className="form-label">Class *</label>
            <select className="form-select">
              {CLASS_OPTIONS.slice(1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <select className="form-select">
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Father&apos;s Name *</label>
            <input type="text" className="form-input" placeholder="Father's full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Father&apos;s Mobile *</label>
            <div className="input-group">
              <span className="input-prefix">+91</span>
              <input type="tel" className="form-input" placeholder="10-digit number" maxLength={10} />
            </div>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <textarea className="form-textarea" placeholder="Full address" rows={2} />
          </div>
        </div>
      </Modal>

      <BuildPromptModal 
        isOpen={!!buildPrompt} 
        onClose={() => setBuildPrompt(null)} 
        title={buildPrompt?.title} 
        prompt={buildPrompt?.prompt} 
      />
    </div>
  );
}
