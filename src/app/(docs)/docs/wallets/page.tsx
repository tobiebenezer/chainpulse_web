'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, Cpu, Wallet, Layers } from 'lucide-react';

export default function MonitoredWalletsDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Add new wallet address to monitor
curl -X POST "https://api.chainpulse.io/v1/wallets" \\
  -H "X-API-Key: cp_live_83b17df082a4d9..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "chain": "bsc",
    "address": "0x55d398326f99059fF775485246999027B3197955",
    "label": "Hot Wallet Inflow",
    "confirmation_threshold": 12
  }'`,
    nodejs: `// Monitor a new wallet in Node.js
import { ChainPulse } from 'chainpulse-node';

const pulse = new ChainPulse({ apiKey: 'cp_live_83b17df082a4d9...' });

const wallet = await pulse.wallets.create({
  chain: 'bsc',
  address: '0x55d398326f99059fF775485246999027B3197955',
  label: 'Hot Wallet Inflow',
  confirmation_threshold: 12
});
console.log('Wallet address configured:', wallet.id);`,
    go: `// Register monitored wallet in Go
package main

import (
	"context"
	"fmt"
	"github.com/tobisamuel/chainpulse-go"
)

func main() {
	client := chainpulse.NewClient("cp_live_83b17df082a4d9...")
	wallet, _ := client.Wallets.Create(context.Background(), chainpulse.WalletParams{
		Chain:                 "bsc",
		Address:               "0x55d398326f99059fF775485246999027B3197955",
		Label:                 "Hot Wallet Inflow",
		ConfirmationThreshold: 12,
	})
	fmt.Printf("Registered wallet: %s with ID %s\\n", wallet.Address, wallet.ID)
}`,
    python: `# Register monitored wallet in Python
from chainpulse import ChainPulse

client = ChainPulse(api_key="cp_live_83b17df082a4d9...")

wallet = client.wallets.create(
    chain="bsc",
    address="0x55d398326f99059fF775485246999027B3197955",
    label="Hot Wallet Inflow",
    confirmation_threshold=12
)
print(f"Registered wallet ID: {wallet.id}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Submitting new monitored target wallet address...
> Network: Binance Smart Chain
> Verifying hex address checksum format...
> Saving configuration block...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Validation SUCCESS.
> Wallet configured under active scan. [201 Created]

` + JSON.stringify({
  status: "success",
  code: 201,
  data: {
    id: "wlt_9b3e1c0da43f019f",
    chain: "bsc",
    address: "0x55d398326f99059fF775485246999027B3197955",
    label: "Hot Wallet Inflow",
    confirmation_threshold: 12,
    active: true,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Wallet size={12} /> Address Tracking
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Monitored Wallets API
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            The Wallets API allows tenants to dynamically add, list, update, and remove smart contract or user wallet addresses for continuous chain ingestion monitoring.
          </p>
        </section>

        {/* Endpoints */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available Actions
          </h2>

          {/* POST /v1/wallets */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(0, 229, 255, 0.1)', color: 'var(--color-secondary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>POST</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>/v1/wallets</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Register a new wallet address. ChainPulse will immediately begin checking all incoming blocks on the selected chain for matches.
            </p>
          </div>

          {/* GET /v1/wallets */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(0, 255, 102, 0.1)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>GET</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>/v1/wallets</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              List all monitored wallet addresses for the current tenant environment. Support pagination parameters <code style={{ color: 'var(--color-secondary)' }}>page</code> and <code style={{ color: 'var(--color-secondary)' }}>limit</code>.
            </p>
          </div>

          {/* DELETE /v1/wallets/{id} */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255, 51, 102, 0.1)', color: 'var(--color-danger)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>DELETE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>/v1/wallets/&#123;id&#125;</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Remove a wallet from active monitoring.
            </p>
          </div>
        </section>

        {/* POST Request Schema */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--color-secondary)' }} />
            Payload Schema (POST)
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#fff' }}>
                <th style={{ padding: '10px 0' }}>Field</th>
                <th style={{ padding: '10px 0' }}>Type</th>
                <th style={{ padding: '10px 0' }}>Required</th>
                <th style={{ padding: '10px 0' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>chain</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>string</td>
                <td style={{ padding: '10px 0', color: 'var(--color-danger)' }}>Yes</td>
                <td style={{ padding: '10px 0' }}>The targeted blockchain. Currently <code style={{ color: 'var(--color-primary)' }}>bsc</code> is supported.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>address</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>string</td>
                <td style={{ padding: '10px 0', color: 'var(--color-danger)' }}>Yes</td>
                <td style={{ padding: '10px 0' }}>The hex blockchain address string to monitor.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>label</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>string</td>
                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>No</td>
                <td style={{ padding: '10px 0' }}>A custom name or description tag for tracking.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>confirmation_threshold</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>integer</td>
                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>No</td>
                <td style={{ padding: '10px 0' }}>Minimum blocks built on top of event before dispatch. Defaults to <code style={{ color: 'var(--color-primary)' }}>1</code>.</td>
              </tr>
            </tbody>
          </table>
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
            <div className="terminal-title">Register Monitored Address</div>
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
                <Play size={12} /> {isLoadingTerminal ? 'Syncing...' : 'Register Wallet'}
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
