'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { apiFetch } from '@/lib/api-client';
import { ToastProvider } from '@/components/ui/toast';
import {
  ShieldAlert,
  Users,
  LogOut,
  ShieldCheck,
  BookOpen,
  LayoutDashboard,
  Terminal,
  Activity,
  Wallet,
  History,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  kyb_status: string;
  is_superuser: boolean;
  created_at: string;
}

const SIDEBAR_W = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: meData, error: meError, isLoading: loadingMe } = useQuery<{ tenant: Tenant }>({
    queryKey: ['me'],
    queryFn: () => apiFetch<{ tenant: Tenant }>('/v1/me'),
    retry: false,
    staleTime: 60000,
  });

  useEffect(() => {
    if (meError) {
      router.push('/login');
    } else if (meData && !meData.tenant.is_superuser) {
      router.push('/dashboard');
    }
  }, [meData, meError, router]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const logoutMutation = useMutation({
    mutationFn: () => apiFetch('/v1/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });

  if (loadingMe || !meData || !meData.tenant.is_superuser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', minHeight: '100vh', gap: '16px', justifyContent: 'center', backgroundColor: 'var(--bg-void)' }}>
        <ShieldAlert size={32} style={{ color: 'var(--color-warning)', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          DECRYPTING SUPERUSER PRIVILEGES...
        </span>
      </div>
    );
  }

  const superuser = meData.tenant;

  const menuItems = [
    { href: '/admin',              label: 'System Overview',  icon: LayoutDashboard },
    { href: '/admin/tenants',      label: 'Tenant Directory', icon: Users },
    { href: '/admin/kyb',          label: 'Compliance Queue', icon: ShieldCheck },
    { href: '/admin/wallets',      label: 'Global Wallets',   icon: Wallet },
    { href: '/admin/transactions', label: 'Global Ledger',    icon: History },
    { href: '/admin/audit-logs',   label: 'Security Ledger',  icon: BookOpen },
  ];

  // ─── Sidebar content (shared between desktop + mobile drawer) ─────────────
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand header */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <Logo size={18} />
          <span style={{ fontSize: '9px', color: 'var(--color-primary)', letterSpacing: '0.15em', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', paddingLeft: '40px', marginTop: '-4px' }}>
            CORE ADMIN V1
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="admin-mobile-close"
          aria-label="Close menu"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none', display: 'none' }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '12px', marginBottom: '8px', display: 'block' }}>
          Admin Console
        </span>
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '4px',
                color: active ? '#fff' : 'var(--text-muted)',
                background: active ? 'rgba(0,255,102,0.07)' : 'transparent',
                border: `1px solid ${active ? 'rgba(0,255,102,0.18)' : 'transparent'}`,
                fontWeight: active ? 600 : 500,
                fontSize: '13px',
                transition: 'all 0.18s ease',
                textDecoration: 'none',
              }}
            >
              <Icon size={16} style={{ color: active ? 'var(--color-primary)' : 'inherit', flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)', flexShrink: 0, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {superuser.email}
          </span>
        </div>
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
        >
          <ExternalLink size={13} /> Partner View
        </Link>
        <button
          onClick={() => logoutMutation.mutate()}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '9px', borderRadius: '4px', background: 'rgba(255,51,102,0.05)', border: '1px solid rgba(255,51,102,0.15)', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit' }}
        >
          <LogOut size={13} />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-void)', color: 'var(--text-primary)' }}>

        {/* ─── Mobile backdrop overlay ─── */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 49, backdropFilter: 'blur(2px)' }}
          />
        )}

        {/* ─── Sidebar (desktop: fixed left; mobile: slide-in drawer) ─── */}
        <aside
          style={{
            width: `${SIDEBAR_W}px`,
            borderRight: '1px solid var(--border-color)',
            background: 'rgba(8,10,15,0.97)',
            backdropFilter: 'blur(20px)',
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 50,
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
          className={`admin-sidebar${drawerOpen ? ' admin-sidebar--open' : ''}`}
        >
          <SidebarContent />
        </aside>

        {/* ─── Main content ─── */}
        <div
          className="admin-main"
          style={{ flex: 1, paddingLeft: `${SIDEBAR_W}px`, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          {/* Mobile topbar */}
          <header
            className="admin-topbar-mobile"
            style={{
              display: 'none',
              height: '60px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(6,7,9,0.95)',
              backdropFilter: 'blur(12px)',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              position: 'sticky',
              top: 0,
              zIndex: 40,
            }}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', outline: 'none', padding: '4px' }}
            >
              <Menu size={24} />
            </button>
            <Logo size={16} />
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.2)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
              ROOT
            </span>
          </header>

          {/* Desktop sticky header */}
          <header
            className="admin-topbar-desktop"
            style={{
              height: '64px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(6,7,9,0.8)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 32px',
              position: 'sticky',
              top: 0,
              zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={14} style={{ color: 'var(--color-primary)', animation: 'pulse 2s infinite' }} />
              <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.05em' }}>
                SYSTEM: OPERATIONAL
              </span>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '4px', background: 'rgba(255,51,102,0.06)', border: '1px solid var(--color-primary-border)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.06em' }}>
              ROOT ACCESS
            </span>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: '28px 32px' }}>
            {children}
          </main>
        </div>
      </div>

      {/* Responsive CSS via a style tag */}
      <style>{`
        /* Default: desktop — sidebar visible, mobile bars hidden */
        .admin-sidebar { transform: translateX(0); }
        .admin-topbar-mobile { display: none !important; }
        .admin-topbar-desktop { display: flex !important; }
        .admin-mobile-close { display: none !important; }

        @media (max-width: 1024px) {
          /* Hide desktop sidebar off-screen */
          .admin-sidebar {
            transform: translateX(-100%);
          }
          /* Slide in when open */
          .admin-sidebar--open {
            transform: translateX(0) !important;
          }
          /* Show the close button inside the drawer */
          .admin-sidebar--open .admin-mobile-close {
            display: flex !important;
          }
          /* Main area takes full width */
          .admin-main {
            padding-left: 0 !important;
          }
          /* Show mobile topbar, hide desktop header */
          .admin-topbar-mobile {
            display: flex !important;
          }
          .admin-topbar-desktop {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .admin-main main {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </ToastProvider>
  );
}
