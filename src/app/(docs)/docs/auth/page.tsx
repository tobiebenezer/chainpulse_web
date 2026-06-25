'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, Shield, Lock, AlertTriangle } from 'lucide-react';

export default function AuthenticationDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Request using sandbox API Key header
curl -X GET "https://api.chainpulse.io/v1/events" \\
  -H "X-API-Key: cp_sandbox_9b3e1c0da43f019f" \\
  -H "Content-Type: application/json"`,
    nodejs: `// Make authenticated call with custom headers
const response = await fetch('https://api.chainpulse.io/v1/events', {
  headers: {
    'X-API-Key': 'cp_sandbox_9b3e1c0da43f019f',
    'Content-Type': 'application/json'
  }
});
console.log('Status:', response.status);`,
    go: `// Authenticated call in Go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	req, _ := http.NewRequest("GET", "https://api.chainpulse.io/v1/events", nil)
	req.Header.Set("X-API-Key", "cp_sandbox_9b3e1c0da43f019f")
	req.Header.Set("Content-Type", "application/json")
	
	resp, _ := http.DefaultClient.Do(req)
	defer resp.Body.Close()
	fmt.Println("Response Status:", resp.Status)
}`,
    python: `# Authenticated call in Python
import requests

headers = {
    "X-API-Key": "cp_sandbox_9b3e1c0da43f019f",
    "Content-Type": "application/json"
}
response = requests.get("https://api.chainpulse.io/v1/events", headers=headers)
print(f"Status Code: {response.status_code}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Testing request with sandbox key...
> Validating credential token...
> Matching tenant workspace context...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Key validated successfully!
> API Key Environment: SANDBOX
> Limit: 100 requests/min [Current usage: 1]
> OK. Authorization successful. [200 OK]

` + JSON.stringify({
  status: "success",
  authenticated: true,
  environment: "sandbox",
  tenant: "tnt_sandbox_9a12c8",
  rate_limit: {
    max_requests_per_minute: 100,
    current_remaining: 99,
    reset_seconds: 59
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Lock size={12} /> Security
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Authentication API
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            ChainPulse secures all API endpoints with custom token authentication. Credentials restrict request scope and track workspace rate limit allocations.
          </p>
        </section>

        {/* Custom API Key Header */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: 'var(--color-primary)' }} />
            The X-API-Key Header
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            All incoming HTTP requests must supply your API key string via the <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>X-API-Key</code> request header. Calls with missing or revoked keys will return an immediate 401 Unauthorized status.
          </p>
        </section>

        {/* Token Format */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: 'var(--color-secondary)' }} />
            API Key Formats
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            ChainPulse generates two distinct scopes of keys upon registration to facilitate separation between development and staging environments:
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#fff' }}>
                <th style={{ padding: '10px 0' }}>Prefix</th>
                <th style={{ padding: '10px 0' }}>Environment Scope</th>
                <th style={{ padding: '10px 0' }}>Security Rule</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>cp_sandbox_</td>
                <td style={{ padding: '10px 0' }}>Sandbox / Test</td>
                <td style={{ padding: '10px 0' }}>Accepts local HTTP webhooks.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>cp_live_</td>
                <td style={{ padding: '10px 0' }}>Production</td>
                <td style={{ padding: '10px 0' }}>Enforces HTTPS on all webhooks.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Safety Warning */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div className="cyber-card" style={{ padding: '16px', background: 'rgba(255, 51, 102, 0.02)', border: '1px solid var(--color-danger-glow)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertTriangle size={16} style={{ color: 'var(--color-danger)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Never share production API keys</span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Keep your API keys secret. Never commit your keys to version control systems or store them directly inside frontend Javascript bundles. If a key is compromised, revoke it immediately in the console credentials manager.
                </p>
              </div>
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
            <div className="terminal-title">Credential Verification</div>
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
                <Play size={12} /> {isLoadingTerminal ? 'Verifying...' : 'Validate Key'}
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
