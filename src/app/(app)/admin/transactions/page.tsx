'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  X,
  ExternalLink,
  Info
} from 'lucide-react';

interface TransactionEvent {
  id: string;
  tenant_id: string;
  tenant_name: string;
  wallet_id: string;
  wallet_label?: string;
  chain: string;
  token: string;
  token_contract: string;
  tx_hash: string;
  log_index: number;
  sender_address: string;
  recipient_address: string;
  amount_raw: string;
  amount: string;
  block_number: number;
  confirmations: number;
  confirmation_threshold: number;
  status: string;
  environment: string;
  detected_at: string;
  confirmed_at?: string;
  invalidated_at?: string;
}

interface PaginatedResponse {
  data: TransactionEvent[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<TransactionEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const limit = 10;

  const { data: response, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['admin-transactions', page],
    queryFn: () => apiFetch<PaginatedResponse>(`/v1/admin/transactions?page=${page}&limit=${limit}`),
    placeholderData: (prev) => prev,
  });

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(val);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const txs = response?.data || [];
  const totalItems = response?.total || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Client-side filtering
  const filteredTxs = txs.filter((tx) => {
    const matchesSearch =
      tx.tx_hash.toLowerCase().includes(search.toLowerCase()) ||
      (tx.tenant_name || '').toLowerCase().includes(search.toLowerCase()) ||
      tx.sender_address.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipient_address.toLowerCase().includes(search.toLowerCase());

    const matchesEnv = envFilter === 'all' || tx.environment === envFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesChain = chainFilter === 'all' || tx.chain.toLowerCase() === chainFilter.toLowerCase();

    return matchesSearch && matchesEnv && matchesStatus && matchesChain;
  });

  const formatAmount = (amt: string, symbol: string) => {
    const parsed = parseFloat(amt);
    if (isNaN(parsed)) return `${amt} ${symbol}`;
    return `${parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${symbol}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.02em', color: '#fff', margin: 0 }}>
          GLOBAL TRANSACTION LEDGER
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Real-time transaction events monitored across all tenant workspaces.
        </p>
      </div>

      {/* Search & Filters */}
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
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by hash, sender, recipient, or tenant..."
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

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="invalidated">Invalidated</option>
          </select>

          {/* Environment filter */}
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

          {/* Chain filter */}
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

      {/* List Table */}
      <div style={{
        background: 'rgba(10, 12, 18, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SCANNING BLOCKCHAIN TRANSACTION LEDGER...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
            DECRYPTION ERROR: {(error as Error).message}
          </div>
        ) : filteredTxs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transaction events found matching the criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(5, 7, 10, 0.4)' }}>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tx Hash</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tenant</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Chain</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Asset / Value</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Confirmations</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Detected</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTx(tx)}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Tx Hash */}
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 500 }}>
                          {tx.tx_hash.substring(0, 6)}...{tx.tx_hash.substring(tx.tx_hash.length - 6)}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.tx_hash)}
                          title="Copy transaction hash"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedId === tx.tx_hash ? 'var(--color-primary)' : 'var(--text-muted)',
                            transition: 'color 0.2s',
                            padding: '2px'
                          }}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {tx.tenant_name}
                    </td>

                    {/* Chain */}
                    <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {tx.chain.toUpperCase()}
                    </td>

                    {/* Asset/Value */}
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                      {formatAmount(tx.amount, tx.token)}
                    </td>

                    {/* Confirmations Progress Bar */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          <span>{tx.confirmations} blocks</span>
                          <span>/ {tx.confirmation_threshold}</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            background: tx.status === 'confirmed' ? 'var(--color-primary)' : tx.status === 'invalidated' ? 'var(--color-danger)' : 'var(--color-secondary)',
                            width: `${Math.min(100, (tx.confirmations / tx.confirmation_threshold) * 100)}%`,
                            transition: 'width 0.3s ease-out'
                          }} />
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: tx.status === 'confirmed' ? 'rgba(0, 255, 102, 0.08)' : tx.status === 'invalidated' ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 229, 255, 0.08)',
                        border: tx.status === 'confirmed' ? '1px solid rgba(0, 255, 102, 0.2)' : tx.status === 'invalidated' ? '1px solid rgba(255, 51, 102, 0.2)' : '1px solid rgba(0, 229, 255, 0.2)',
                        color: tx.status === 'confirmed' ? 'var(--color-primary)' : tx.status === 'invalidated' ? 'var(--color-danger)' : 'var(--color-secondary)'
                      }}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Detected At */}
                    <td style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(tx.detected_at).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedTx(tx)}
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
            TOTAL EVENTS LOGGED: {totalItems}
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

      {/* Inspect Side Drawer */}
      {selectedTx && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '520px',
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
              <History size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>
                Transaction Event Details
              </h3>
            </div>
            <button
              onClick={() => setSelectedTx(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
            {/* Hash */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>TX HASH</label>
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
                  {selectedTx.tx_hash}
                </span>
                <button
                  onClick={() => handleCopy(selectedTx.tx_hash)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedId === selectedTx.tx_hash ? 'var(--color-primary)' : 'var(--text-muted)',
                    marginLeft: '8px'
                  }}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Block Number & Chain & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Chain</label>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                  {selectedTx.chain.toUpperCase()}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Block</label>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#fff', marginTop: '4px' }}>
                  #{selectedTx.block_number}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Status</label>
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: selectedTx.status === 'confirmed' ? 'rgba(0, 255, 102, 0.08)' : selectedTx.status === 'invalidated' ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 229, 255, 0.08)',
                    color: selectedTx.status === 'confirmed' ? 'var(--color-primary)' : selectedTx.status === 'invalidated' ? 'var(--color-danger)' : 'var(--color-secondary)'
                  }}>
                    {selectedTx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Monitored Amount</label>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {formatAmount(selectedTx.amount, selectedTx.token)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Raw Amount</label>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '6px', wordBreak: 'break-all' }}>
                  {selectedTx.amount_raw}
                </div>
              </div>
            </div>

            {/* Tenant Owner info */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tenant Owner</label>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                {selectedTx.tenant_name}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ID: {selectedTx.tenant_id}
              </span>
            </div>

            {/* Wallet info */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Associated Wallet</label>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                {selectedTx.wallet_label || 'Unnamed Wallet'}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ID: {selectedTx.wallet_id}
              </span>
            </div>

            {/* Addresses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Sender Address</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {selectedTx.sender_address}
                  </span>
                  <button onClick={() => handleCopy(selectedTx.sender_address)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Recipient Address</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {selectedTx.recipient_address}
                  </span>
                  <button onClick={() => handleCopy(selectedTx.recipient_address)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              {selectedTx.token_contract && (
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Token Contract</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {selectedTx.token_contract}
                    </span>
                    <button onClick={() => handleCopy(selectedTx.token_contract)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Time Stats */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Clock size={14} />
                <span>Detected: {new Date(selectedTx.detected_at).toLocaleString()}</span>
              </div>
              {selectedTx.confirmed_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '12px' }}>
                  <CheckCircle size={14} />
                  <span>Confirmed: {new Date(selectedTx.confirmed_at).toLocaleString()}</span>
                </div>
              )}
              {selectedTx.invalidated_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '12px' }}>
                  <XCircle size={14} />
                  <span>Invalidated: {new Date(selectedTx.invalidated_at).toLocaleString()}</span>
                </div>
              )}
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
              href={selectedTx.chain === 'bsc' ? `https://bscscan.com/tx/${selectedTx.tx_hash}` : `https://etherscan.io/tx/${selectedTx.tx_hash}`}
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
