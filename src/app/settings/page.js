'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { FiSave, FiWifi, FiWifiOff, FiLoader, FiCheck, FiX, FiPlus, FiTrash2, FiUser, FiPhone, FiMail, FiMapPin, FiSettings as FiSettingsIcon } from 'react-icons/fi';

const WA_PROVIDERS = [
  { value: 'geta_ai', label: 'Geta AI' },
  { value: 'meta_cloud', label: 'Meta Cloud API' },
  { value: 'twilio', label: 'Twilio' },
  { value: 'wati', label: 'WATI' },
  { value: 'custom', label: 'Custom / Other' },
];

const DEMO_USERS = [
  { id: 1, name: 'Admin User', phone: '9999999999', role: 'admin', status: 'Active' },
  { id: 2, name: 'Lakshmi Priya', phone: '9876543200', role: 'teacher', status: 'Active' },
  { id: 3, name: 'Rajesh Sharma', phone: '9876543210', role: 'parent', status: 'Active' },
  { id: 4, name: 'Sunita Devi', phone: '9876543250', role: 'parent', status: 'Active' },
];

export default function SettingsPage() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState('school');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // School Info
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'VOO School',
    fullName: 'Vidhya Ojas Omkara School',
    address: 'Vanasthalipuram, Hyderabad - 500070',
    phone: '040-12345678',
    email: 'info@vooschool.com',
    website: 'school.vooschool.com',
    principal: 'Dr. Radhika Varma',
  });

  // WhatsApp Config
  const [waConfig, setWaConfig] = useState({
    provider: 'geta_ai',
    apiKey: '',
    apiUrl: '',
    phoneNumber: '',
    enabled: false,
  });
  const [waStatus, setWaStatus] = useState('disconnected'); // connected | disconnected | testing

  // Email config
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: '587',
    username: '',
    password: '',
    fromEmail: 'noreply@vooschool.com',
    fromName: 'VOO School',
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestWA = async () => {
    setWaStatus('testing');
    // Simulate test
    await new Promise((r) => setTimeout(r, 2000));
    setWaStatus(waConfig.apiKey ? 'connected' : 'disconnected');
  };

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ minHeight: '400px' }}>
        <FiSettingsIcon className="empty-state-icon" />
        <h3 className="empty-state-title">Access Denied</h3>
        <p className="empty-state-text">Only administrators can access settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '48px', width: '400px', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-lg)' }} />
        <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const tabs = [
    { key: 'school', label: 'School Info' },
    { key: 'whatsapp', label: 'WhatsApp API ⭐' },
    { key: 'email', label: 'Email' },
    { key: 'users', label: 'Users' },
    { key: 'academic', label: 'Academic Year' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Manage school settings and integrations
          </p>
        </div>
        {saveSuccess && (
          <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: 'var(--font-sm)' }}>
            <FiCheck style={{ fontSize: '14px' }} /> Saved successfully
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {/* ===== SCHOOL INFO ===== */}
          {activeTab === 'school' && (
            <div className="settings-section">
              <h3 className="settings-section-title">School Information</h3>
              <div className="settings-grid">
                <div className="form-group">
                  <label className="form-label">School Name</label>
                  <input type="text" className="form-input" value={schoolInfo.name} onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={schoolInfo.fullName} onChange={(e) => setSchoolInfo({ ...schoolInfo, fullName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-input" value={schoolInfo.phone} onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={schoolInfo.email} onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input type="text" className="form-input" value={schoolInfo.website} onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Principal</label>
                  <input type="text" className="form-input" value={schoolInfo.principal} onChange={(e) => setSchoolInfo({ ...schoolInfo, principal: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={schoolInfo.address} onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })} rows={2} />
              </div>
              <div style={{ marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {!saving && <><FiSave style={{ fontSize: '14px' }} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* ===== WHATSAPP API ===== */}
          {activeTab === 'whatsapp' && (
            <div className="settings-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <h3 className="settings-section-title" style={{ margin: 0 }}>WhatsApp API Configuration</h3>
                <div className={`connection-status ${waStatus}`}>
                  <span className="connection-status-dot" />
                  {waStatus === 'connected' && 'Connected'}
                  {waStatus === 'disconnected' && 'Not Connected'}
                  {waStatus === 'testing' && 'Testing...'}
                </div>
              </div>

              <div className="alert alert-info" style={{ marginBottom: 'var(--space-lg)' }}>
                <FiSettingsIcon className="alert-icon" />
                <div className="alert-content">
                  <div className="alert-title">WhatsApp Integration</div>
                  <div className="alert-text">
                    Connect your WhatsApp Business API to send fee reminders, attendance alerts, and announcements to parents automatically.
                  </div>
                </div>
              </div>

              <div className="settings-grid">
                <div className="form-group">
                  <label className="form-label">API Provider *</label>
                  <select
                    className="form-select"
                    value={waConfig.provider}
                    onChange={(e) => setWaConfig({ ...waConfig, provider: e.target.value })}
                  >
                    {WA_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Phone Number</label>
                  <div className="input-group">
                    <span className="input-prefix">+91</span>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Business phone number"
                      value={waConfig.phoneNumber}
                      onChange={(e) => setWaConfig({ ...waConfig, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">API Key / Token *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Your API key or access token"
                    value={waConfig.apiKey}
                    onChange={(e) => setWaConfig({ ...waConfig, apiKey: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">API URL / Endpoint *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://api.provider.com/v1/messages"
                    value={waConfig.apiUrl}
                    onChange={(e) => setWaConfig({ ...waConfig, apiUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Test Button */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-secondary ${waStatus === 'testing' ? 'btn-loading' : ''}`}
                  onClick={handleTestWA}
                  disabled={waStatus === 'testing'}
                >
                  {waStatus !== 'testing' && (
                    <>
                      {waStatus === 'connected' ? <FiWifi /> : <FiWifiOff />}
                      Test Connection
                    </>
                  )}
                </button>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {!saving && <><FiSave style={{ fontSize: '14px' }} /> Save Configuration</>}
                </button>
              </div>

              {/* Template List */}
              <div style={{ marginTop: 'var(--space-xl)' }}>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
                  Message Templates
                </h4>
                {[
                  { name: 'Fee Reminder — Gentle', status: 'Approved', id: 'fee_reminder_gentle' },
                  { name: 'Fee Reminder — Urgent', status: 'Approved', id: 'fee_reminder_urgent' },
                  { name: 'Attendance Alert', status: 'Pending', id: 'attendance_alert' },
                  { name: 'Exam Schedule', status: 'Approved', id: 'exam_schedule' },
                  { name: 'General Announcement', status: 'Approved', id: 'general_announcement' },
                ].map((tpl) => (
                  <div
                    key={tpl.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>{tpl.name}</span>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>{tpl.id}</span>
                    </div>
                    <span className={`badge ${tpl.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                      {tpl.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== EMAIL ===== */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Email Settings</h3>
              <div className="settings-grid">
                <div className="form-group">
                  <label className="form-label">SMTP Host</label>
                  <input type="text" className="form-input" placeholder="smtp.gmail.com" value={emailConfig.smtpHost} onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input type="text" className="form-input" value={emailConfig.smtpPort} onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" placeholder="Email username" value={emailConfig.username} onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="App password" value={emailConfig.password} onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">From Email</label>
                  <input type="email" className="form-input" value={emailConfig.fromEmail} onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">From Name</label>
                  <input type="text" className="form-input" value={emailConfig.fromName} onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })} />
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary">Test Email</button>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {!saving && <><FiSave style={{ fontSize: '14px' }} /> Save</>}
                </button>
              </div>
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeTab === 'users' && (
            <div className="settings-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h3 className="settings-section-title" style={{ margin: 0 }}>User Management</h3>
                <button className="btn btn-primary btn-sm">
                  <FiPlus style={{ fontSize: '14px' }} /> Add User
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_USERS.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                              background: 'linear-gradient(135deg, var(--primary), #A855F7)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                            }}>
                              {u.name.charAt(0)}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td>{u.phone}</td>
                        <td>
                          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                        </td>
                        <td><span className="badge badge-success">Active</span></td>
                        <td>
                          <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--danger)' }}>
                            <FiTrash2 style={{ fontSize: '14px' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== ACADEMIC YEAR ===== */}
          {activeTab === 'academic' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Academic Year</h3>
              <div className="settings-grid" style={{ maxWidth: '500px' }}>
                <div className="form-group">
                  <label className="form-label">Current Academic Year</label>
                  <select className="form-select">
                    <option>2025-26</option>
                    <option>2024-25</option>
                    <option>2023-24</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year Start Date</label>
                  <input type="date" className="form-input" defaultValue="2025-04-01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Year End Date</label>
                  <input type="date" className="form-input" defaultValue="2026-03-31" />
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {!saving && <><FiSave style={{ fontSize: '14px' }} /> Save</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
