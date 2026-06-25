'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, Cpu, Code2, Terminal } from 'lucide-react';

export default function NodeJSClientDocsPage() {
  const [activeTab, setActiveTab] = useState<'npm' | 'pnpm' | 'yarn'>('pnpm');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const installTemplates = {
    npm: `npm install chainpulse-node`,
    pnpm: `pnpm add chainpulse-node`,
    yarn: `yarn add chainpulse-node`
  };

  const codeTemplate = `import { ChainPulse } from 'chainpulse-node';

// Initialize Client
const pulse = new ChainPulse({
  apiKey: 'cp_live_83b17df082a4d9...',
  environment: 'production'
});

// Subscribe to Transfer events on BSC
const webhook = await pulse.webhooks.create({
  url: 'https://api.myclientapp.com/webhooks/chainpulse',
  events: ['Transfer'],
  chain: 'bsc'
});

console.log(\`Active webhook registered: \${webhook.id}\`);`;

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Initializing NodeJS Client simulation...
> Loading credentials...
> Connection stabilized...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> ChainPulse Client initialised successfully.
> Subscriptions loaded: 1 active webhook.
> Ingest status: SYNCHRONIZED`);
      setIsLoadingTerminal(false);
    }, 1000);
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
            <Code2 size={12} /> NodeJS SDK
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            NodeJS SDK Integration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Integrate ChainPulse into your NodeJS or Next.js applications seamlessly using our official client library.
          </p>
        </section>

        {/* Installation */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            Installation
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            Add the package to your project dependency file:
          </p>

          <div className="cyber-terminal" style={{ marginBottom: '24px' }}>
            <div className="terminal-tabs" style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              {(['npm', 'pnpm', 'yarn'] as const).map((tab) => (
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
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', padding: '16px', background: '#04060b' }}>
              <button
                onClick={handleCopyInstall}
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
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#fff' }}>
                {installTemplates[activeTab]}
              </pre>
            </div>
          </div>
        </section>

        {/* Basic Usage */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            Basic Usage
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            Import the client, initialise it with your API Key, and invoke the API operations:
          </p>

          <div style={{ position: 'relative', background: '#04060b', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '16px' }}>
            <button
              onClick={handleCopyCode}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '4px',
                padding: '6px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              {copiedCode ? <Check size={14} style={{ color: 'var(--color-primary)' }} /> : <Copy size={14} />}
            </button>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#fff', overflowX: 'auto', whiteSpace: 'pre' }}>
              {codeTemplate}
            </pre>
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
            <div className="terminal-title">NodeJS Integration Engine</div>
          </div>
          <div className="terminal-body" style={{ padding: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 12px 0' }}>
              Run the integration compiler simulator to verify dependency loading.
            </p>
            <button
              className="cyber-btn"
              onClick={runTerminalSimulation}
              disabled={isLoadingTerminal}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Play size={12} /> {isLoadingTerminal ? 'Compiling...' : 'Run Integration'}
            </button>

            {terminalOutput && (
              <div style={{
                marginTop: '16px',
                background: '#04060b',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '12px',
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
