'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { CreditCard, Check, ShieldAlert, Cpu, Layers, HelpCircle } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  glowColor: string;
}

export default function BillingPage() {
  const { tenant } = useDashboard();
  const queryClient = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState<PricingTier | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const plans: PricingTier[] = [
    {
      id: 'free',
      name: 'Free Sandbox',
      price: '$0',
      period: 'forever',
      description: 'Perfect for development testing & small personal RPC failover set ups.',
      features: [
        'Single Webhook endpoint limit',
        '1,000 transactions monitored / month',
        'Legacy retry logic (exponential backoff)',
        'Sandbox environment support only',
        'Community Discord assistance'
      ],
      cta: 'Current Plan',
      glowColor: 'var(--border-color-active)'
    },
    {
      id: 'pro',
      name: 'Production Pro',
      price: '$49',
      period: 'month',
      description: 'Ideal for scaling systems requiring production-grade failover and redundancy.',
      features: [
        'Up to 10 Webhook endpoints',
        'Unlimited transaction processing',
        'Simultaneous multi-node RPC failover routing',
        'Interactive real-time webhook replayer',
        'Sandbox & Production environments',
        'Detailed compliance audit logs (30-day history)',
        'Priority API support'
      ],
      cta: 'Upgrade to Pro',
      badge: 'Popular',
      glowColor: 'var(--color-primary)'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      price: '$299',
      period: 'month',
      description: 'For institutions requiring absolute uptime, dedicated throughput, and compliance features.',
      features: [
        'Unlimited Webhook configurations',
        'Dedicated webhook delivery queue instances',
        'Custom private RPC node endpoints',
        '99.99% webhook delivery SLA guarantee',
        'Infinite log storage & audit trails',
        'Dedicated 24/7 account engineer support',
        'Custom rate-limiting profiles'
      ],
      cta: 'Upgrade to Enterprise',
      glowColor: 'var(--color-secondary)'
    }
  ];

  const upgradePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      setError('');
      setSuccessMsg('');
      return apiFetch('/v1/billing/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan: planId }),
      });
    },
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSuccessMsg(`Your subscription plan has been updated to ${planId.toUpperCase()}!`);
      setSelectedPlan(null);
      // Reset payment fields
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setCardName('');
    },
    onError: (err: any) => {
      setError(err.message || 'Payment simulation failed. Please try again.');
    }
  });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError('Please fill in all credit card payment details.');
      return;
    }
    if (selectedPlan) {
      upgradePlanMutation.mutate(selectedPlan.id);
    }
  };

  const handleUpgradeClick = (plan: PricingTier) => {
    if (plan.id === tenant.plan) return;
    setError('');
    setSuccessMsg('');
    setSelectedPlan(plan);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div>
        <h2 style={{ textTransform: 'uppercase', color: '#fff', fontSize: '20px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard style={{ color: 'var(--color-primary)' }} />
          Billing & Subscription Plan
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Control and upgrade your partner account subscription tier, manage nodes, and increase transaction capacity.
        </p>
      </div>

      {/* Success / Error notification alerts */}
      {successMsg && (
        <div className="cyber-card" style={{ borderLeft: '4px solid var(--color-primary)', background: 'rgba(0, 255, 102, 0.05)', padding: '16px 24px' }}>
          <h4 style={{ color: 'var(--color-primary)', textTransform: 'uppercase', fontSize: '14px', fontWeight: 700 }}>
            Subscription Upgrade Successful
          </h4>
          <p style={{ fontSize: '13px', color: '#fff', marginTop: '4px' }}>
            {successMsg} Your API keys and usage scopes have been updated immediately.
          </p>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {plans.map((plan) => {
          const isCurrent = tenant.plan === plan.id;
          return (
            <div 
              key={plan.id} 
              className="cyber-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isCurrent ? plan.glowColor : 'var(--border-color)',
                boxShadow: isCurrent ? `0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 15px ${plan.glowColor}33` : undefined,
                background: isCurrent ? 'rgba(13, 16, 23, 0.9)' : undefined
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <span className="cyber-badge cyber-badge-success" style={{ animation: 'pulse 2s infinite ease-in-out' }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Title & Pricing */}
                <h3 style={{ textTransform: 'uppercase', fontSize: '16px', color: '#fff', marginBottom: '8px' }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: isCurrent ? 'var(--color-primary)' : '#fff' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    / {plan.period}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', minHeight: '36px', lineHeight: '1.5' }}>
                  {plan.description}
                </p>

                {/* Features list */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                    Features & Deliverables:
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', alignItems: 'flex-start' }}>
                        <Check size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to Action button */}
              <button
                onClick={() => handleUpgradeClick(plan)}
                disabled={isCurrent}
                className={`cyber-btn ${isCurrent ? 'cyber-btn-secondary' : ''}`}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: isCurrent ? 'transparent' : undefined,
                  border: isCurrent ? '1px solid var(--color-primary-border)' : undefined,
                  color: isCurrent ? 'var(--color-primary)' : undefined
                }}
              >
                {isCurrent ? 'Active Subscription' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Simulated Checkout Modal */}
      {selectedPlan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          padding: '16px'
        }}>
          <div className="cyber-card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ textTransform: 'uppercase', color: 'var(--color-primary)' }}>Secure Subscription Checkout</h3>
              <span className="cyber-badge cyber-badge-info">{selectedPlan.price} / mo</span>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              You are upgrading to <strong>{selectedPlan.name}</strong>. Enter billing information to process the simulated subscription fee.
            </p>

            {error && <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="cyber-label">Name on Card</label>
                <input
                  type="text"
                  required
                  className="cyber-input"
                  placeholder="e.g. John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div>
                <label className="cyber-label">Card Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    className="cyber-input"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  />
                  <CreditCard size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="cyber-label">Expiration Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    className="cyber-input"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\//g, '');
                      if (val.length > 2) {
                        val = val.substring(0, 2) + '/' + val.substring(2);
                      }
                      setExpiry(val);
                    }}
                  />
                </div>
                <div>
                  <label className="cyber-label">CVC / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    className="cyber-input"
                    placeholder="***"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedPlan(null)} 
                  className="cyber-btn cyber-btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgradePlanMutation.isPending}
                  className="cyber-btn"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {upgradePlanMutation.isPending ? 'Processing Secure Pay...' : 'Authorize Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Billing History / Invoices */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Layers size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice & Payment History</h3>
        </div>

        <div className="cyber-table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Bill Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tenant.plan !== 'free' ? (
                <tr>
                  <td className="mono-val" style={{ color: 'var(--color-primary)' }}>INV-2026-0042</td>
                  <td>Jun 17, 2026</td>
                  <td>ChainPulse {tenant.plan === 'pro' ? 'Production Pro' : 'Enterprise Scale'} Subscription (Simulated)</td>
                  <td>{tenant.plan === 'pro' ? '$49.00' : '$299.00'}</td>
                  <td>
                    <span className="cyber-badge cyber-badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                      <span style={{ width: '6px', height: '6px', background: 'var(--color-primary)', borderRadius: '50%' }}></span>
                      Paid
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => alert('Simulating invoice PDF download...')}
                      className="cyber-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ) : null}
              <tr>
                <td className="mono-val" style={{ color: 'var(--color-primary)' }}>INV-2026-0001</td>
                <td>Jun 11, 2026</td>
                <td>ChainPulse Free Sandbox Initialization</td>
                <td>$0.00</td>
                <td>
                  <span className="cyber-badge cyber-badge-info" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--color-secondary)', borderRadius: '50%' }}></span>
                    No Charge
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>N/A</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Warning banner */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
        <HelpCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Payment transactions are simulated for platform evaluation purposes. Live credit card networks are not charged during this demo sandbox phase.
        </span>
      </div>

    </div>
  );
}
