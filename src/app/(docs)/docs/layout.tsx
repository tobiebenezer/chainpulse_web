'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Menu,
  X
} from 'lucide-react';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on link click (mobile UX)
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  const navigation = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Introduction', href: '/docs' },
        { name: 'Quick Start', href: '/docs/quickstart' },
        { name: 'Architecture', href: '/docs/architecture' },
      ],
    },
    {
      title: 'API Reference',
      items: [
        { name: 'Authentication', href: '/docs/auth' },
        { name: 'Monitored Wallets', href: '/docs/wallets' },
        { name: 'Block Events', href: '/docs/events' },
        { name: 'Webhook Routing', href: '/docs/webhooks' },
        { name: 'Sandbox Payments', href: '/docs/sandbox' },
      ],
    },
    {
      title: 'SDKs & Libraries',
      items: [
        { name: 'NodeJS SDK', href: '/docs/sdk/nodejs' },
        { name: 'Go Client', href: '/docs/sdk/go' },
        { name: 'Python Client', href: '/docs/sdk/python' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#060709', position: 'relative' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(6, 7, 9, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="lg-hidden"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontSize: '13px' }} className="md-only">
              <ArrowLeft size={14} /> Back Home
            </Link>
            <span style={{ color: 'var(--border-color)' }} className="md-only">|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Logo size={20} />
              <span className="cyber-badge cyber-badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>Docs</span>
            </div>
          </div>
          
          {/* Simple Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '6px 12px',
            width: '280px'
          }} className="md-only">
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search documentation..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/login" className="cyber-btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
              Login
            </Link>
            <Link href="/register" className="cyber-btn" style={{ padding: '6px 12px', fontSize: '11px' }}>
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: '57px', // header height
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 35
          }}
          className="lg-hidden"
        />
      )}

      {/* Main Docs Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        width: '100%',
        flex: 1,
      }} className="docs-layout-container">
        <style jsx global>{`
          .lg-hidden {
            display: flex;
          }
          .docs-sidebar {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @media (max-width: 1023px) {
            .docs-sidebar {
              position: fixed !important;
              top: 57px !important;
              left: 0 !important;
              bottom: 0 !important;
              width: 280px !important;
              transform: translateX(-100%) !important;
              box-shadow: 10px 0 30px rgba(0, 0, 0, 0.7) !important;
            }
            .docs-sidebar.open {
              transform: translateX(0) !important;
            }
          }
          @media (min-width: 1024px) {
            .docs-layout-container {
              grid-template-columns: 260px 1fr !important;
            }
            .lg-hidden {
              display: none !important;
            }
          }
        `}</style>

        {/* Sidebar Navigation */}
          <aside
          className={`docs-sidebar ${isSidebarOpen ? 'open' : ''}`}
          style={{
            borderRight: '1px solid var(--border-color)',
            padding: '32px 24px',
            background: 'rgba(6, 7, 9, 0.98)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {navigation.map((section) => (
            <div key={section.title}>
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {section.title}
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        style={{
                          fontSize: '13px',
                          color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                          textDecoration: 'none',
                          fontWeight: isActive ? 600 : 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isActive && <ChevronRight size={12} style={{ color: 'var(--color-primary)' }} />}
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Page Content wrapper */}
        <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
