'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ShieldAlert, Plus, Trash2, Copy, Check, Info, AlertTriangle } from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface APIKey {
  id: string;
  tenant_id: string;
  name: string;
  environment: string;
  key_prefix: string;
  revoked_at?: string;
}

interface CreateAPIKeyResponse {
  api_key: APIKey;
  secret: string;
  message: string;
}

// Modal rendered via a portal-like approach using a sibling div to escape overflow clipping
function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      {children}
    </div>
  );
}

export default function ApiKeysPage() {
  const { env } = useDashboard();
  const queryClient = useQueryClient();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [keyError, setKeyError] = useState('');
  const [disclosedKey, setDisclosedKey] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<APIKey | null>(null);

  const { success, error: toastError } = useToast();

  const { data: keysData, isLoading: loadingKeys } = useQuery<PaginatedResponse<APIKey>>({
    queryKey: ['apiKeys', env],
    queryFn: () => apiFetch<PaginatedResponse<APIKey>>(`/v1/api-keys?limit=50`),
  });

  // API already filters by env via the X-Environment header; additionally filter out revoked ones
  const activeKeys = keysData?.data?.filter(k => !k.revoked_at) ?? [];

  const createKeyMutation = useMutation({
    mutationFn: () => {
      setKeyError('');
      setDisclosedKey(null);
      return apiFetch<CreateAPIKeyResponse>('/v1/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName, environment: newKeyEnv }),
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setNewKeyName('');
      setDisclosedKey(res.secret);
      setShowKeyModal(false);
      success('API key created. Copy the secret before it disappears.');
    },
    onError: (err: any) => {
      setKeyError(err.message || 'Failed to create API key');
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/v1/api-keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setRevokeTarget(null);
      success('API key revoked successfully.');
    },
    onError: (err: any) => {
      setRevokeTarget(null);
      toastError(err.message || 'Failed to revoke key');
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const openModal = () => {
    setKeyError('');
    setNewKeyName('');
    setNewKeyEnv(env);
    setShowKeyModal(true);
  };

  return (
    <>
      {/* Revoke Confirm Modal */}
      <ConfirmModal
        open={!!revokeTarget}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${revokeTarget?.name}"? All requests using this key will be rejected immediately. This cannot be undone.`}
        confirmLabel="Revoke"
        variant="danger"
        loading={revokeKeyMutation.isPending}
        onConfirm={() => revokeTarget && revokeKeyMutation.mutate(revokeTarget.id)}
        onCancel={() => setRevokeTarget(null)}
      />
      {/* Create Key Modal */}
      {showKeyModal && (
        <Modal>
          <div
            className="cyber-card"
            style={{ maxWidth: '480px', width: '100%', padding: '28px' }}
          >
            <h3 style={{ marginBottom: '16px', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
              Create Credentials
            </h3>
            {keyError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '12px' }}>
                {keyError}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="cyber-label">Key Name / Description</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="e.g. Ingestion Worker"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div>
                <label className="cyber-label">Environment Scope</label>
                <select
                  className="cyber-input"
                  style={{ background: 'var(--bg-void)', color: '#fff' }}
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value as 'sandbox' | 'production')}
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowKeyModal(false)}
                className="cyber-btn cyber-btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => createKeyMutation.mutate()}
                disabled={createKeyMutation.isPending}
                className="cyber-btn"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                {createKeyMutation.isPending ? 'Generating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Developer API Keys
            </h3>
          </div>
          <button onClick={openModal} className="cyber-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Plus size={14} /> Create API Key
          </button>
        </div>

        {/* Disclosed Key Banner */}
        {disclosedKey && (
          <div
            className="cyber-alert"
            style={{ marginBottom: '24px', borderLeft: '4px solid var(--color-warning)' }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ textTransform: 'uppercase', color: '#fff', fontSize: '14px', marginBottom: '8px' }}>
                  Save Your API Key
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Copy this API key now. For your security, it will not be shown again.
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '12px',
                    border: '1px dashed var(--color-warning)',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    className="mono-val"
                    style={{ flex: 1, wordBreak: 'break-all', fontSize: '13px', color: 'var(--color-warning)' }}
                  >
                    {disclosedKey}
                  </span>
                  <button
                    onClick={() => copyToClipboard(disclosedKey, 'api-key-disclosed')}
                    className="cyber-btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedText === 'api-key-disclosed' ? (
                      <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    ) : (
                      <Copy size={14} />
                    )}
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cyber-table-container">
          {loadingKeys ? (
            <div style={{ padding: '24px', color: 'var(--text-muted)' }}>
              QUERYING ACTIVE SECURITY TOKENS...
            </div>
          ) : activeKeys.length > 0 ? (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Token Prefix</th>
                  <th>Environment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeKeys.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td className="mono-val" style={{ color: 'var(--color-primary)' }}>
                      {k.key_prefix}...
                    </td>
                    <td>
                      <span
                        className={`cyber-badge ${k.environment === 'production' ? 'cyber-badge-success' : 'cyber-badge-info'}`}
                      >
                        {k.environment}
                      </span>
                    </td>
                    <td>
                      <span
                        className="cyber-badge cyber-badge-success"
                        style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            background: 'var(--color-primary)',
                            borderRadius: '50%',
                          }}
                        />
                        Active
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setRevokeTarget(k)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-danger)',
                          outline: 'none',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              No API Keys created for the {env} environment scope yet.
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255,255,255,0.01)',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
          }}
        >
          <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            API keys authenticate programmatic requests. Pass the key in the{' '}
            <code>X-API-Key</code> request header.
          </span>
        </div>
      </div>
    </>
  );
}
