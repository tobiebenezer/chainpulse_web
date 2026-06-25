'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, ArrowRight, Shield, Zap } from 'lucide-react';

export default function QuickStartPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Step 1: Request sandbox API Key, then execute setup
curl -X POST "https://api.chainpulse.io/v1/register" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "dev@example.com", "company_name": "Web3 Startup"}'`,
    nodejs: `// Step 2: Initialize SDK and register a webhook receiver
import { ChainPulse } from 'chainpulse-node';

const pulse = new ChainPulse({ apiKey: 'cp_live_83b17df082a4d9...' });

const webhook = await pulse.webhooks.create({
  url: 'https://api.myclientapp.com/webhooks/chainpulse',
  events: ['Transfer', 'Approval'],
  chain: 'bsc'
});
console.log('Registered Webhook:', webhook.id);`,
    go: `// Step 2: Initialize in Go
package main

import (
	"context"
	"fmt"
	"github.com/tobisamuel/chainpulse-go"
)

func main() {
	client := chainpulse.NewClient("cp_live_83b17df082a4d9...")
	hook, _ := client.Webhooks.Create(context.Background(), chainpulse.WebhookParams{
		URL:   "https://api.myclientapp.com/webhooks/chainpulse",
		Events: []string{"Transfer"},
		Chain:  "bsc",
	})
	fmt.Println("Created webhook ID:", hook.ID)
}`,
    python: `# Step 2: Initialize in Python
from chainpulse import ChainPulse

client = ChainPulse(api_key="cp_live_83b17df082a4d9...")

webhook = client.webhooks.create(
    url="https://api.myclientapp.com/webhooks/chainpulse",
    events=["Transfer"],
    chain="bsc"
)
print(f"Created webhook ID: {webhook.id}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Initializing project registration...
> Requesting API access credential tokens...
> Generating client workspace env...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Registered sandbox key: cp_sandbox_9b3e1c0da43f019f
> Registered production key: cp_live_83b17df082a4d9...
> Webhook signature secret: sec_hmac_fb90d238cfa...
> OK. Connection stabilized. [201 Created]

` + JSON.stringify({
  status: "success",
  code: 201,
  data: {
    tenant_id: "tnt_sandbox_9a12c8",
    email: "dev@example.com",
    api_keys: {
      sandbox: "cp_sandbox_9b3e1c0da43f019f",
      production: "cp_live_83b17df082a4d9..."
    },
    webhook_secret: "sec_hmac_fb90d238cfa...",
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
            <Zap size={12} /> Getting Started
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Quick Start Guide
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Get up and running with ChainPulse in less than 5 minutes. In this guide, we will register an account, obtain API keys, and test event ingestion routing.
          </p>
        </section>

        {/* Step 1 */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0, 255, 102, 0.1)', color: 'var(--color-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>1</span>
            Get an API Access Key
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            Before accessing ChainPulse endpoints, register a tenant workspace. You can do this programmatically via the registry endpoint (as shown in the terminal sandbox) or through the user interface on the registration screen.
          </p>
          <div className="cyber-card" style={{ padding: '16px', background: 'rgba(0, 229, 255, 0.02)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Shield size={16} style={{ color: 'var(--color-secondary)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Sandbox vs Production Credentials</span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Sandbox keys are designated for development environments and allow local HTTP webhook test receivers. Production keys enforce TLS/HTTPS endpoints for all active webhook targets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0, 255, 102, 0.1)', color: 'var(--color-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>2</span>
            Register a Webhook Target
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            Use the API Key you generated to register a destination webhook listener. Choose the specific blockchain networks (e.g. Binance Smart Chain, Ethereum) and event topics to forward to your API server.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Forward Smart Contract transfer actions instantaneously.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Route failed blockchain node requests dynamically to standby RPCs.</span>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0, 255, 102, 0.1)', color: 'var(--color-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>3</span>
            Handle Event Streams
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Set up an endpoint on your server to receive POST requests, parse the incoming JSON, and verify the cryptographic HMAC signature before processing. Refer to the Webhook Routing reference for implementation details.
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
            <div className="terminal-title">Quickstart Setup Execution</div>
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
                <Play size={12} /> {isLoadingTerminal ? 'Executing...' : 'Run Simulation'}
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
