'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, Send, Wallet, ShieldCheck, Ticket } from 'lucide-react';

export default function SandboxDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Trigger a confirmed sandbox payment
curl -X POST "https://api.chainpulse.io/v1/sandbox/payments" \
  -H "X-API-Key: cp_test_9b3e1c0da43f019f" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": "wlt_sandbox_ethereum_eth",
    "amount": "25.50",
    "reference": "order_10021",
    "idempotency_key": "checkout-10021"
  }'`,
    nodejs: `const response = await fetch('https://api.chainpulse.io/v1/sandbox/payments', {
  method: 'POST',
  headers: {
    'X-API-Key': 'cp_test_9b3e1c0da43f019f',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    wallet_id: 'wlt_sandbox_ethereum_eth',
    amount: '25.50',
    reference: 'order_10021',
    idempotency_key: 'checkout-10021'
  })
});

const result = await response.json();`,
    go: `reqBody := strings.NewReader(
  \`{"wallet_id":"wlt_sandbox_ethereum_eth","amount":"25.50","reference":"order_10021","idempotency_key":"checkout-10021"}\`)

req, _ := http.NewRequest("POST", "https://api.chainpulse.io/v1/sandbox/payments", reqBody)
req.Header.Set("X-API-Key", "cp_test_9b3e1c0da43f019f")
req.Header.Set("Content-Type", "application/json")`,
    python: `import requests

response = requests.post(
    'https://api.chainpulse.io/v1/sandbox/payments',
    headers={
        'X-API-Key': 'cp_test_9b3e1c0da43f019f',
        'Content-Type': 'application/json'
    },
    json={
        'wallet_id': 'wlt_sandbox_ethereum_eth',
        'amount': '25.50',
        'reference': 'order_10021',
        'idempotency_key': 'checkout-10021'
    }
)`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ POST /v1/sandbox/payments
> Resolving sandbox wallet...
> Validating amount and idempotency key...
> Creating confirmed event in tx_events...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Event inserted with source=sandbox_trigger
> Webhook queued for sandbox delivery
> Response: [201 Created]\n\n` + JSON.stringify({
        idempotent: false,
        warnings: [],
        transaction: {
          id: 'tx_sandbox_7f2d1c',
          chain: 'ethereum',
          asset: 'eth',
          amount: '25.5',
          reference: 'order_10021',
          source: 'sandbox_trigger',
          status: 'confirmed'
        }
      }, null, 2));
      setIsLoadingTerminal(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', width: '100%', flex: 1 }} className="docs-inner-container">
      <style jsx global>{`
        @media (min-width: 1024px) {
          .docs-inner-container {
            grid-template-columns: 1fr 400px !important;
          }
        }
      `}</style>

      <main style={{ overflowY: 'auto' }} className="docs-main-content">
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Wallet size={12} /> Sandbox
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Sandbox Payments API
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Use seeded sandbox wallets to simulate a real payment flow. The trigger creates a confirmed event immediately, increments sandbox usage, and sends the normal webhook delivery path.
          </p>
        </section>

        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
            What Happens
          </h2>
          <ul style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '18px', margin: 0 }}>
            <li>New tenants get seeded sandbox wallets for every active supported market.</li>
            <li>Existing tenants can backfill the same wallets with <code style={{ color: 'var(--color-primary)' }}>make seed-sandbox</code>.</li>
            <li><code style={{ color: 'var(--color-primary)' }}>POST /v1/sandbox/payments</code> accepts either <code>wallet_id</code> or <code>chain + asset + address</code>.</li>
            <li><code>reference</code> is stored on the transaction and echoed to the webhook payload.</li>
            <li><code>idempotency_key</code> prevents duplicate test payments.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={18} style={{ color: 'var(--color-secondary)' }} />
            Request Shape
          </h2>
          <pre style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '4px',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            lineHeight: 1.6
          }}>
{`{
  "wallet_id": "optional",
  "chain": "ethereum",
  "asset": "eth",
  "address": "0x...",
  "amount": "25.50",
  "sender_address": "optional",
  "reference": "order_10021",
  "idempotency_key": "checkout-10021"
}`}
          </pre>
        </section>

        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} style={{ color: 'var(--color-secondary)' }} />
            Response Notes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            The API returns the created transaction, whether the request was idempotent, and any warnings. If no sandbox webhook is active, the transaction still exists and the response includes a warning.
          </p>
        </section>
      </main>

      <aside style={{ overflowY: 'auto' }} className="docs-sandbox-sidebar">
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Interactive Sandbox
        </h2>

        <div className="cyber-terminal">
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
            <div className="terminal-title">Sandbox Payment Trigger</div>
          </div>

          <div className="terminal-tabs" style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
            {(['curl', 'nodejs', 'go', 'python'] as const).map((tab) => (
              <button
                key={tab}
                className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '12px 0', border: 'none', background: activeTab === tab ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: activeTab === tab ? 'var(--color-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px',
                  fontFamily: 'var(--font-mono)', borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent'
                }}
              >
                {tab === 'curl' ? 'cURL' : tab === 'nodejs' ? 'NodeJS' : tab === 'go' ? 'Go' : 'Python'}
              </button>
            ))}
          </div>

          <div className="terminal-body" style={{ position: 'relative', padding: '16px' }}>
            <button
              onClick={handleCopy}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '4px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--color-primary)' }} /> : <Copy size={14} />}
            </button>

            <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {codeTemplates[activeTab]}
            </pre>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
              <button className="cyber-btn" onClick={runTerminalSimulation} disabled={isLoadingTerminal} style={{ padding: '8px 16px', fontSize: '12px' }}>
                <Play size={12} /> {isLoadingTerminal ? 'Triggering...' : 'Trigger Payment'}
              </button>
            </div>

            {terminalOutput && (
              <div style={{
                marginTop: '16px',
                background: '#04060b',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '12px',
                maxHeight: '220px',
                overflowY: 'auto',
                fontSize: '12px',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-mono)'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{terminalOutput}</pre>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
