'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Play
} from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `curl -X GET "https://api.chainpulse.io/v1/events" \\
  -H "X-API-Key: cp_live_83b17df082a4d9..." \\
  -H "Content-Type: application/json"`,
    nodejs: `// Next.js / React API Consumption Example
const response = await fetch('https://api.chainpulse.io/v1/events', {
  headers: {
    'X-API-Key': 'cp_live_83b17df082a4d9...',
    'Content-Type': 'application/json'
  }
});
const result = await response.json();
console.log(result.events);`,
    go: `package main

import (
	"fmt"
	"net/http"
)

func main() {
	req, _ := http.NewRequest("GET", "https://api.chainpulse.io/v1/events", nil)
	req.Header.Set("X-API-Key", "cp_live_83b17df082a4d9...")
	req.Header.Set("Content-Type", "application/json")
	
	resp, _ := http.DefaultClient.Do(req)
	defer resp.Body.Close()
	fmt.Println("Status:", resp.Status)
}`,
    python: `import requests

url = "https://api.chainpulse.io/v1/events"
headers = {
    "X-API-Key": "cp_live_83b17df082a4d9...",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Running request to ChainPulse Endpoint...
> Contacting RPC cluster failover layers...
> Authorizing client via tenant sandbox keys...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Fetching events for contract: 0x55d398326f99059fF775485246999027B3197955 (USDT-BSC)
> OK. Connection stabilized. [200 OK]

` + JSON.stringify({
  status: "success",
  code: 200,
  data: {
    tenant_id: "tnt_prod_bc04781",
    latest_synchronized_block: 39285124,
    events: [
      {
        transaction_hash: "0x39a1c8f1e8a93cb02a014902...",
        event_name: "Transfer",
        from: "0xe2130df...",
        to: "0x14798a3...",
        value: "450.00 USDT",
        confirmations: 15
      }
    ],
    failover_status: {
      primary_rpc: "Alchemy",
      active_rpc: "Alchemy",
      nodes_online: 5,
      seconds_since_last_sync: 1
    }
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
        <section id="intro" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            API Reference Docs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Welcome to the ChainPulse Developer Reference. Our platform provides high-availability webhook routing, real-time transaction event ingestion, sandbox payment simulation, and RPC failover brokering for BSC, Ethereum, TRON, and Solana.
          </p>
        </section>

        <section id="auth" style={{ marginBottom: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Authentication
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            All API requests must contain your unique API Key passed in the custom header <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>X-API-Key</code>.
          </p>
          <div className="cyber-card" style={{ padding: '16px', background: 'rgba(255, 51, 102, 0.03)', border: '1px solid rgba(255, 51, 102, 0.15)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>SECURITY WARNING:</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Keep your API credentials safe. Do not expose private keys in frontend bundles or client-accessible repositories.
            </p>
          </div>
        </section>

        <section id="endpoints" style={{ marginBottom: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            API Endpoints
          </h2>

          {/* GET /v1/events */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(0, 255, 102, 0.1)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>GET</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>/v1/events</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Query a list of processed block events matching active node filters and configuration.
            </p>
          </div>

          {/* POST /v1/webhooks */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(0, 229, 255, 0.1)', color: 'var(--color-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>POST</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>/v1/webhooks</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Register a new webhook listener. In sandbox, HTTP and HTTPS URLs are accepted. In production, only HTTPS is allowed.
            </p>
          </div>

          {/* POST /v1/sandbox/payments */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255, 204, 0, 0.12)', color: 'var(--color-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>POST</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>/v1/sandbox/payments</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Trigger a confirmed sandbox payment against a seeded wallet. Use it to test webhooks, idempotency, and merchant reconciliation without touching real RPC providers.
            </p>
          </div>
        </section>

        <section id="webhook-signatures" style={{ marginBottom: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Webhook HMAC Signatures
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            All webhook payloads dispatched by our background workers are cryptographically signed using an HMAC calculated over the raw body payload with your decrypted client secret. Validate incoming requests by calculating the HMAC signature on your server.
          </p>
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
            <div className="terminal-title">Interactive Terminal Sandbox</div>
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
                <Play size={12} /> {isLoadingTerminal ? 'Querying...' : 'Test Request'}
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
