'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { DashboardProvider, useDashboard } from './dashboard-context';
import { ToastProvider } from '@/components/ui/toast';
import {
  Activity,
  Layers,
  Globe,
  Radio,
  LogOut,
  ShieldCheck,
  Cpu,
  Key,
  Menu,
  X,
  CreditCard,
  User,
  Settings
} from 'lucide-react';

function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    env,
    handleEnvChange,
    tenant,
    kybData,
    logoutMutation,
    submitKybMutation,
    showKybModal,
    setShowKybModal,
    kybFullName,
    setKybFullName,
    kybBusinessName,
    setKybBusinessName,
    kybPhoneNumber,
    setKybPhoneNumber,
    kybCountry,
    setKybCountry,
    kybCategory,
    setKybCategory,
    kybWebsite,
    setKybWebsite,
    kybUseCase,
    setKybUseCase,
    kybIdType,
    setKybIdType,
    kybIdNumber,
    setKybIdNumber,
    kybError,
    setKybError
  } = useDashboard();

  const menuItems = [
    { path: '/dashboard', label: 'Console Overview', icon: <Activity size={16} /> },
    { path: '/dashboard/wallets', label: 'Nodes & Wallets', icon: <Cpu size={16} /> },
    { path: '/dashboard/webhooks', label: 'Webhook Config', icon: <Radio size={16} /> },
    { path: '/dashboard/deliveries', label: 'Webhook Deliveries', icon: <Layers size={16} /> },
    { path: '/dashboard/transactions', label: 'Transaction Ledger', icon: <Globe size={16} /> },
    { path: '/dashboard/api-keys', label: 'API Credentials', icon: <Key size={16} /> },
    { path: '/dashboard/billing', label: 'Billing & Plans', icon: <CreditCard size={16} /> },
    { path: '/dashboard/profile', label: 'Account Profile', icon: <User size={16} /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  const handleKybModalOpen = () => {
    setKybFullName('');
    setKybBusinessName('');
    setKybPhoneNumber('');
    setKybCountry('');
    setKybCategory('');
    setKybWebsite('');
    setKybUseCase('');
    setKybIdType('passport');
    setKybIdNumber('');
    setKybError('');
    setShowKybModal(true);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Topbar */}
      <header className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', outline: 'none' }}
          >
            <Menu size={24} />
          </button>
          <Logo size={18} />
        </div>
        <div className="cyber-badge cyber-badge-info">
          {env}
        </div>
      </header>

      {/* Sidebar Overlay (Mobile Only) */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Brand & Close Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <Logo size={20} />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'none', outline: 'none' }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Partner Profiling & Badges */}
        <div style={{ padding: '20px 24px', background: 'rgba(255, 255, 255, 0.01)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Partner Portal</span>
            <div className="cyber-badge cyber-badge-info">{tenant.plan}</div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenant.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenant.email}
          </div>
          {tenant.is_superuser && (
            <button
              onClick={() => router.push('/admin')}
              className="cyber-badge cyber-badge-warning"
              style={{ marginTop: '10px', width: '100%', cursor: 'pointer', justifyContent: 'center', border: '1px solid var(--color-warning)' }}
            >
              Superuser Admin
            </button>
          )}
        </div>

        {/* Environment Switcher */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Environment
          </label>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '3px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => handleEnvChange('sandbox')}
              style={{
                flex: 1,
                padding: '6px 0',
                background: env === 'sandbox' ? 'var(--color-secondary)' : 'transparent',
                color: env === 'sandbox' ? 'var(--text-dark)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              Sandbox
            </button>
            <button
              onClick={() => handleEnvChange('production')}
              style={{
                flex: 1,
                padding: '6px 0',
                background: env === 'production' ? 'var(--color-primary)' : 'transparent',
                color: env === 'production' ? 'var(--text-dark)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              Production
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>
            Workspace Console
          </div>
          {menuItems.map(item => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: active ? 'var(--color-primary-glow)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: active ? 'var(--color-primary-border)' : 'transparent',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => logoutMutation.mutate()}
            className="cyber-btn cyber-btn-secondary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', gap: '8px' }}
          >
            <LogOut size={14} />
            Exit Console
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="main-content-container">
        {/* Sticky Desktop Top Status Bar */}
        <header style={{
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(6, 7, 9, 0.4)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }} className="desktop-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-primary)' }} className="animate-pulse-glow" />
            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              System: Operational
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="cyber-badge cyber-badge-info" style={{ textTransform: 'uppercase' }}>
              Env: {env}
            </div>
            {tenant.kyb_status === 'verified' ? (
              <span className="cyber-badge cyber-badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                <ShieldCheck size={12} /> Verified
              </span>
            ) : (
              <span 
                className={`cyber-badge ${tenant.kyb_status === 'pending' ? 'cyber-badge-warning' : 'cyber-badge-danger'}`} 
                style={{ cursor: 'pointer', display: 'inline-flex', gap: '4px', alignItems: 'center' }}
                onClick={handleKybModalOpen}
              >
                <ShieldCheck size={12} /> {tenant.kyb_status === 'pending' ? 'KYB Auditing' : 'KYB Required'}
              </span>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {/* KYB Verification Banner Alert */}
          {tenant.kyb_status !== 'verified' && (
            <div style={{
              background: tenant.kyb_status === 'pending' ? 'rgba(255, 183, 0, 0.08)' : 'rgba(255, 51, 102, 0.08)',
              border: `1px solid ${tenant.kyb_status === 'pending' ? 'var(--color-warning)' : 'var(--color-danger)'}`,
              borderRadius: '4px',
              padding: '16px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div>
                <h4 style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: tenant.kyb_status === 'pending' ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                  <ShieldCheck size={18} />
                  {tenant.kyb_status === 'pending' ? 'KYB Verification Underway' : tenant.kyb_status === 'rejected' ? 'KYB Application Rejected' : 'Compliance Action Needed: Submit KYB'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {tenant.kyb_status === 'pending' 
                    ? 'Our compliance desk is currently auditing your legal identity documents. You are restricted to Sandbox environments until verified.' 
                    : tenant.kyb_status === 'rejected' 
                    ? `Your KYB submission was rejected. Reason: "${kybData?.reviewer_notes || 'Invalid identification document.'}"` 
                    : 'Submit verification details to complete partner onboarding and clear restrictions for production usage.'}
                </p>
              </div>
              {tenant.kyb_status !== 'pending' && (
                <button 
                  onClick={handleKybModalOpen}
                  className="cyber-btn"
                  style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {tenant.kyb_status === 'rejected' ? 'Re-Apply KYB' : 'Verify Identity'}
                </button>
              )}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* KYB Submission Modal */}
      {showKybModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          padding: '16px', overflowY: 'auto'
        }}>
          <div className="cyber-card" style={{ maxWidth: '600px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '8px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Compliance KYB Application</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Please provide valid corporate details for KYC auditing by compliance services.
            </p>
            {kybError && <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '12px' }}>{kybError}</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="cyber-label">Corporate Business Name</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="e.g. Acme Web3 Solutions Ltd"
                  value={kybBusinessName}
                  onChange={(e) => setKybBusinessName(e.target.value)}
                />
              </div>
              <div>
                <label className="cyber-label">Representative Full Name</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="Jane Doe"
                  value={kybFullName}
                  onChange={(e) => setKybFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="cyber-label">Contact Phone Number</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="+1 (555) 019-2834"
                  value={kybPhoneNumber}
                  onChange={(e) => setKybPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="cyber-label">Country of Incorporation</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="e.g. United Kingdom"
                  value={kybCountry}
                  onChange={(e) => setKybCountry(e.target.value)}
                />
              </div>
              <div>
                <label className="cyber-label">Business Category</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="e.g. Payment Gateway"
                  value={kybCategory}
                  onChange={(e) => setKybCategory(e.target.value)}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="cyber-label">Corporate Website or Socials</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="https://acme-web3.io"
                  value={kybWebsite}
                  onChange={(e) => setKybWebsite(e.target.value)}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="cyber-label">Intended Webhook Use Case</label>
                <textarea
                  className="cyber-input"
                  rows={2}
                  placeholder="Explain how ChainPulse scanner webhooks are integrated with your platform..."
                  value={kybUseCase}
                  onChange={(e) => setKybUseCase(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                />
              </div>
              <div>
                <label className="cyber-label">ID Document Type</label>
                <select
                  className="cyber-input"
                  value={kybIdType}
                  onChange={(e) => setKybIdType(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.9)' }}
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div>
                <label className="cyber-label">ID Document Serial Number</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="Document number"
                  value={kybIdNumber}
                  onChange={(e) => setKybIdNumber(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowKybModal(false)} className="cyber-btn cyber-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Cancel
              </button>
              <button 
                onClick={() => submitKybMutation.mutate()} 
                disabled={submitKybMutation.isPending}
                className="cyber-btn" 
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                {submitKybMutation.isPending ? 'Submitting...' : 'Submit Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media query overrides in inline style tag for mobile drawer triggers */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .desktop-topbar {
            display: none !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DashboardProvider>
        <DashboardLayoutShell>
          {children}
        </DashboardLayoutShell>
      </DashboardProvider>
    </ToastProvider>
  );
}
