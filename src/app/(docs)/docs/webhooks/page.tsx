'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, ShieldAlert, KeyRound, Activity } from 'lucide-react';

export default function WebhookRoutingDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Create new webhook subscription target URL
curl -X POST "https://api.chainpulse.io/v1/webhooks" \\
  -H "X-API-Key: cp_live_83b17df082a4d9..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://api.myclientapp.com/webhooks/receiver",
    "events": ["Transfer"],
    "chain": "bsc",
    "environment": "production"
  }'`,
    nodejs: `// Register a Webhook target in Node.js
import { ChainPulse } from 'chainpulse-node';

const pulse = new ChainPulse({ apiKey: 'cp_live_83b17df082a4d9...' });

const webhook = await pulse.webhooks.create({
  url: 'https://api.myclientapp.com/webhooks/receiver',
  events: ['Transfer'],
  chain: 'bsc',
  environment: 'production'
});
console.log('Webhook registered! HMAC Secret:', webhook.secret);`,
    go: `// Register Webhook target in Go
package main

import (
	"context"
	"fmt"
	"github.com/tobisamuel/chainpulse-go"
)

func main() {
	client := chainpulse.NewClient("cp_live_83b17df082a4d9...")
	hook, _ := client.Webhooks.Create(context.Background(), chainpulse.WebhookParams{
		URL:         "https://api.myclientapp.com/webhooks/receiver",
		Events:      []string{"Transfer"},
		Chain:       "bsc",
		Environment: "production",
	})
	fmt.Printf("Registered Webhook! HMAC Secret: %s\\n", hook.Secret)
}`,
    python: `# Register Webhook target in Python
from chainpulse import ChainPulse

client = ChainPulse(api_key="cp_live_83b17df082a4d9...")

webhook = client.webhooks.create(
    url="https://api.myclientapp.com/webhooks/receiver",
    events=["Transfer"],
    chain="bsc",
    environment="production"
)
print(f"Registered Webhook! Secret: {webhook.secret}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Registering webhook on ChainPulse database...
> Validating target destination URL...
> Generating cryptographic HMAC secret...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Destination URL status check: 200 OK
> Webhook successfully registered. Status code: [201 Created]
> HMAC Signing Secret: sec_hmac_fb90d238cfab392817457a4192b

` + JSON.stringify({
  status: "success",
  code: 201,
  data: {
    webhook_id: "whk_bd9038fc12a4",
    url: "https://api.myclientapp.com/webhooks/receiver",
    chain: "bsc",
    events: ["Transfer"],
    environment: "production",
    active: true,
    secret: "sec_hmac_fb90d238cfab392817457a4192b",
    created_at: new Date().toISOString()
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

      {/* Content Column */}
      <main style={{ overflowY: 'auto' }} className="docs-main-content">
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Activity size={12} /> Real-Time Routing
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Webhook Routing API
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            ChainPulse sends real-time HTTP POST notifications when monitored blockchain events occur. Outbound webhooks include cryptographic signatures for verification.
          </p>
        </section>

        {/* HMAC signature verification */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} style={{ color: 'var(--color-primary)' }} />
            Verifying Signature Payloads
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            To prevent replay attacks and spoofing, each webhook request includes an <code style={{ color: 'var(--color-primary)' }}>X-Signature</code> header. This is a SHA256 HMAC digest computed over the raw request payload body using your webhook's secret key.
          </p>
          <pre style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '4px',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            marginBottom: '20px',
            lineHeight: 1.5
          }}>
{`// Express.js Signature Verification Example
const crypto = require('crypto');

app.post('/webhooks/receiver', (req, res) => {
  const signature = req.headers['x-signature'];
  const secret = 'sec_hmac_fb90d238cfab392817457a4192b';
  
  const hmac = crypto.createHmac('sha256', secret);
  const computed = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed))) {
    // Authorized. Process event...
    res.sendStatus(200);
  } else {
    // Unauthorized! Reject.
    res.sendStatus(401);
  }
});`}
          </pre>
        </section>

        {/* Retries and SLA */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
            Retry Strategy & Dead Letter Queue (DLQ)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            If your API server returns a non-2xx status code or times out, ChainPulse retries the request using exponential backoff:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>Total attempts:</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Up to 5 attempts over 2 hours.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>DLQ isolation:</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>After 5 failures, the event is archived into the Dead Letter Queue for manual replay.</span>
            </div>
          </div>
        </section>
      </main>

      {/* Playground Column (Terminal Sandbox) */}
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
            <div className="terminal-title">Webhook Creation Sandbox</div>
          </div>

          {/* Terminal Navigation */}
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

          {/* Terminal Body */}
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
              <button
                className="cyber-btn"
                onClick={runTerminalSimulation}
                disabled={isLoadingTerminal}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <Play size={12} /> {isLoadingTerminal ? 'Creating...' : 'Create Webhook'}
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
