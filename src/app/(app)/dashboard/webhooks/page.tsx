'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Radio, Plus, AlertTriangle, Key, Copy, Check, Info } from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface WebhookEndpoint {
  id: string;
  tenant_id: string;
  url: string;
  active: boolean;
  environment: string;
  created_at: string;
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      {children}
    </div>
  );
}

export default function WebhooksPage() {
  const { env } = useDashboard();
  const queryClient = useQueryClient();
  const { success, error: toastError, warning } = useToast();

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [webhookError, setWebhookError] = useState('');
  const [webhookSecretDisclosed, setWebhookSecretDisclosed] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Rotate confirm state
  const [rotateTarget, setRotateTarget] = useState<WebhookEndpoint | null>(null);

  const { data: webhooksData, isLoading: loadingWebhooks } = useQuery<PaginatedResponse<WebhookEndpoint>>({
    queryKey: ['webhooks', env],
    queryFn: () => apiFetch<PaginatedResponse<WebhookEndpoint>>('/v1/webhooks?limit=10'),
  });

  const createWebhookMutation = useMutation({
    mutationFn: () => {
      setWebhookError('');
      setWebhookSecretDisclosed(null);
      return apiFetch<{ webhook: WebhookEndpoint; secret: string; message: string }>('/v1/webhooks', {
        method: 'POST',
        body: JSON.stringify({ url: newWebhookUrl }),
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setNewWebhookUrl('');
      setWebhookSecretDisclosed(res.secret);
      setShowWebhookModal(false);
      warning('Save your signing secret — it will not be shown again.', 8000);
    },
    onError: (err: any) => {
      setWebhookError(err.message || 'Failed to register webhook destination');
    },
  });

  const rotateWebhookMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ secret: string; message: string }>(`/v1/webhooks/${id}/rotate-secret`, { method: 'POST' }),
    onSuccess: (res) => {
      setWebhookSecretDisclosed(res.secret);
      setRotateTarget(null);
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      warning('Signing secret rotated — copy and update your server immediately.', 8000);
    },
    onError: (err: any) => {
      setRotateTarget(null);
      toastError(err.message || 'Failed to rotate secret');
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <>
      {/* Register Webhook Modal */}
      {showWebhookModal && (
        <Modal>
          <div className="cyber-card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <h3 style={{ marginBottom: '16px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              Set Destination Endpoint
            </h3>
            {webhookError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '12px' }}>{webhookError}</p>
            )}
            <div>
              <label className="cyber-label">Webhook Endpoint URL</label>
              <input
                type="url" className="cyber-input"
                placeholder={env === 'production' ? 'https://your-domain.com/webhook' : 'http://localhost:3000/webhook'}
                value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                {env === 'production'
                  ? '⚠️ Production endpoints require HTTPS.'
                  : '💡 Sandbox accepts HTTP or HTTPS.'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowWebhookModal(false)}
                className="cyber-btn cyber-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => createWebhookMutation.mutate()}
                disabled={createWebhookMutation.isPending}
                className="cyber-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {createWebhookMutation.isPending ? 'Syncing...' : 'Register'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rotate Secret Confirm */}
      <ConfirmModal
        open={!!rotateTarget}
        title="Rotate Signing Secret"
        message="Rotating invalidates the current secret immediately. Any webhook signature verification using the old key will fail. Your server must be updated with the new secret."
        confirmLabel="Rotate"
        variant="warning"
        loading={rotateWebhookMutation.isPending}
        onConfirm={() => rotateTarget && rotateWebhookMutation.mutate(rotateTarget.id)}
        onCancel={() => setRotateTarget(null)}
      />

      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Webhook Destination Endpoint
            </h3>
          </div>
          {(!webhooksData?.data || webhooksData.data.length === 0) && !loadingWebhooks && (
            <button onClick={() => { setWebhookError(''); setWebhookSecretDisclosed(null); setShowWebhookModal(true); }}
              className="cyber-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Plus size={14} /> Add Webhook Destination
            </button>
          )}
        </div>

        {/* Secret Disclosure Banner */}
        {webhookSecretDisclosed && (
          <div className="cyber-alert" style={{ marginBottom: '24px', borderLeft: '4px solid var(--color-warning)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ textTransform: 'uppercase', color: '#fff', fontSize: '14px', marginBottom: '8px' }}>
                  Store Signing Secret Securely
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Use this secret to verify webhook payload signatures. It will not be shown again.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '12px', border: '1px dashed var(--color-warning)', borderRadius: '4px' }}>
                  <span className="mono-val" style={{ flex: 1, wordBreak: 'break-all', fontSize: '13px', color: 'var(--color-warning)' }}>
                    {webhookSecretDisclosed}
                  </span>
                  <button onClick={() => copyToClipboard(webhookSecretDisclosed, 'wh-secret')}
                    className="cyber-btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {copiedText === 'wh-secret' ? <Check size={14} style={{ color: 'var(--color-primary)' }} /> : <Copy size={14} />}
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cyber-table-container">
          {loadingWebhooks ? (
            <div style={{ padding: '24px', color: 'var(--text-muted)' }}>QUERYING DESTINATION CONFIG...</div>
          ) : webhooksData?.data && webhooksData.data.length > 0 ? (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Webhook Endpoint</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooksData.data.map((w) => (
                  <tr key={w.id}>
                    <td className="mono-val" style={{ fontWeight: 600 }}>{w.url}</td>
                    <td>
                      <span className={`cyber-badge ${w.environment === 'production' ? 'cyber-badge-success' : 'cyber-badge-info'}`}>
                        {w.environment}
                      </span>
                    </td>
                    <td>
                      <span className="cyber-badge cyber-badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--color-primary)', borderRadius: '50%' }} />
                        Listening
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => setRotateTarget(w)}
                        className="cyber-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Key size={12} /> Rotate Secret
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              No webhook endpoints configured. Set one up to route live scanner triggers.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            ChainPulse signs every payload with a cryptographic HMAC in the <code>X-Signature-256</code> header. Validate this on your server to guarantee authenticity.
          </span>
        </div>
      </div>
    </>
  );
}
