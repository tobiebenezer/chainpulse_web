'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  Copy,
  Clock,
  X,
  ExternalLink
} from 'lucide-react';

interface WalletItem {
  id: string;
  tenant_id: string;
  tenant_name: string;
  chain: string;
  address: string;
  label: string;
  active: boolean;
  environment: string;
  confirmation_threshold?: number;
  created_at: string;
}

interface PaginatedResponse {
  data: WalletItem[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminWalletsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const limit = 10;

  const { data: response, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['admin-wallets', page],
    queryFn: () => apiFetch<PaginatedResponse>(`/v1/admin/wallets?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
  });

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(addr);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const wallets = response?.data || [];
  const totalItems = response?.total || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Client-side filtering for search and dropdowns
  const filteredWallets = wallets.filter((w) => {
    const matchesSearch =
      w.address.toLowerCase().includes(search.toLowerCase()) ||
      (w.label || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.tenant_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesEnv = envFilter === 'all' || w.environment === envFilter;
    const matchesChain = chainFilter === 'all' || w.chain.toLowerCase() === chainFilter.toLowerCase();

    return matchesSearch && matchesEnv && matchesChain;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.02em', color: '#fff', margin: 0 }}>
            GLOBAL WALLETS
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Administrative registry of all configured monitoring addresses across all platform tenants.
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div style={{
        background: 'rgba(10, 12, 18, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by address, label, or tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Environment Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              style={{
                background: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          {/* Chain Filter */}
          <select
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value)}
            style={{
              background: 'rgba(5, 7, 10, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Chains</option>
            <option value="bsc">BSC</option>
            <option value="ethereum">Ethereum</option>
          </select>
        </div>
      </div>

      {/* Main wallets list table */}
      <div style={{
        background: 'rgba(10, 12, 18, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SCANNING SYSTEM WALLETS LEDGER...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
            DECRYPTION ERROR: {(error as Error).message}
          </div>
        ) : filteredWallets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No wallets found matching the criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(5, 7, 10, 0.4)' }}>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Label / Info</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tenant Owner</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Chain</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Address</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Environment</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.map((w) => (
                  <tr
                    key={w.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedWallet(w)}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          background: 'rgba(0, 255, 102, 0.05)',
                          border: '1px solid rgba(0, 255, 102, 0.2)',
                          borderRadius: '4px',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Wallet size={16} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>
                            {w.label || 'Unnamed Wallet'}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            ID: {w.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {w.tenant_name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {w.chain.toUpperCase()}
                    </td>
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {w.address.substring(0, 6)}...{w.address.substring(w.address.length - 6)}
                        </span>
                        <button
                          onClick={() => handleCopyAddress(w.address)}
                          title="Copy wallet address"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedId === w.address ? 'var(--color-primary)' : 'var(--text-muted)',
                            transition: 'color 0.2s',
                            padding: '2px'
                          }}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: w.environment === 'production' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 183, 0, 0.08)',
                        border: w.environment === 'production' ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid rgba(255, 183, 0, 0.2)',
                        color: w.environment === 'production' ? 'var(--color-secondary)' : 'var(--color-warning)'
                      }}>
                        {w.environment.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: w.active ? 'var(--color-primary)' : 'var(--text-muted)'
                      }}>
                        {w.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {w.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedWallet(w)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          color: '#fff',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(5, 7, 10, 0.2)'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            TOTAL REGISTERED WALLETS: {totalItems}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: page === 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '13px', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              PAGE {page} OF {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: 'transparent',
                border: 'none',
                color: page === totalPages ? 'rgba(255,255,255,0.2)' : '#fff',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedWallet && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '460px',
          background: 'rgba(10, 12, 18, 0.98)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 50,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Wallet size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>
                Wallet Inspection
              </h3>
            </div>
            <button
              onClick={() => setSelectedWallet(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Wallet Address</label>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', wordBreak: 'break-all' }}>
                  {selectedWallet.address}
                </span>
                <button
                  onClick={() => handleCopyAddress(selectedWallet.address)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedId === selectedWallet.address ? 'var(--color-primary)' : 'var(--text-muted)',
                    marginLeft: '8px'
                  }}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Chain</label>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                  {selectedWallet.chain.toUpperCase()}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Environment</label>
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: selectedWallet.environment === 'production' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 183, 0, 0.08)',
                    color: selectedWallet.environment === 'production' ? 'var(--color-secondary)' : 'var(--color-warning)'
                  }}>
                    {selectedWallet.environment.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tenant Owner</label>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                {selectedWallet.tenant_name}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Tenant ID: {selectedWallet.tenant_id}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Wallet Label</label>
              <div style={{ fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                {selectedWallet.label || 'No custom label assigned'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Active Status</label>
                <div style={{ fontSize: '14px', color: selectedWallet.active ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                  {selectedWallet.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Confirmation Threshold</label>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginTop: '4px' }}>
                  {selectedWallet.confirmation_threshold ?? 15} blocks
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Clock size={14} />
                <span>Configured on {new Date(selectedWallet.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px'
          }}>
            <a
              href={selectedWallet.chain === 'bsc' ? `https://bscscan.com/address/${selectedWallet.address}` : `https://etherscan.io/address/${selectedWallet.address}`}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--color-secondary-glow)',
                border: '1px solid var(--color-secondary-border)',
                color: 'var(--color-secondary)',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <span>View Explorer</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
