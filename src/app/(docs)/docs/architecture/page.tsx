'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, Cpu, Network, ShieldCheck } from 'lucide-react';

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Query active RPC health status and latency logs
curl -X GET "https://api.chainpulse.io/v1/health" \\
  -H "Content-Type: application/json"`,
    nodejs: `// Check node health details via Node.js
import { ChainPulse } from 'chainpulse-node';

const pulse = new ChainPulse({ apiKey: 'cp_live_83b17df082a4d9...' });

const status = await pulse.nodes.getHealth();
console.log('Active RPC Providers:', status.online_providers);
console.log('Current Latency metrics:', status.latencies);`,
    go: `// Check node health details in Go
package main

import (
	"context"
	"fmt"
	"github.com/tobisamuel/chainpulse-go"
)

func main() {
	client := chainpulse.NewClient("cp_live_83b17df082a4d9...")
	status, _ := client.Nodes.GetHealth(context.Background())
	for _, node := range status.OnlineProviders {
		fmt.Printf("Node: %s, Latency: %dms\\n", node.Name, node.LatencyMs)
	}
}`,
    python: `# Check node health details in Python
from chainpulse import ChainPulse

client = ChainPulse(api_key="cp_live_83b17df082a4d9...")

status = client.nodes.get_health()
print(f"Online nodes: {len(status['online_providers'])}")
for node in status['online_providers']:
    print(f" - {node['name']}: {node['latency_ms']}ms")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Requesting system health status...
> Querying BSC ingestor state...
> Measuring latencies on active providers...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Fetch status code: [200 OK]
> Ingestion engine: ACTIVE
> Primary provider: Alchemy [Status: ONLINE, Latency: 42ms]
> Secondary provider: Chainstack [Status: STANDBY, Latency: 98ms]
> Failover triggers registered: 3/3

` + JSON.stringify({
  status: "healthy",
  code: 200,
  data: {
    system: {
      api_gateway: "ONLINE",
      worker_pool: "ACTIVE",
      ingestor_cluster: "SYNCHRONIZED"
    },
    rpc_providers: {
      bsc: [
        { name: "Alchemy", type: "primary", online: true, latency_ms: 42 },
        { name: "Chainstack", type: "secondary", online: true, latency_ms: 98 },
        { name: "BinancePublic", type: "fallback", online: true, latency_ms: 180 }
      ],
      active_failover_occurred: false,
      last_ping: new Date().toISOString()
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
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Network size={12} /> System Design
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Architecture Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            ChainPulse is engineered for near-zero downtime blockchain transaction tracking. Our multi-tenant architecture uses a decoupled ingester-worker pipeline with automatic RPC failover routing.
          </p>
        </section>

        {/* Ingestion Engine */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} style={{ color: 'var(--color-primary)' }} />
            Ingestion Pipeline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            The Block Ingestor continuously tracks the blockchain height. The pipeline parses transactions, extracts event logs, matches configured user filters, and queues webhook deliveries.
          </p>

          {/* ASCII visual diagram */}
          <pre style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '4px',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            lineHeight: 1.5
          }}>
{`[Blockchain RPC]
       │  (Continuous Block Sync)
       ▼
[Ingestion Cluster] ──► [Failover Router] (Swap RPC on failure)
       │
       ▼  (Match Event Filters)
[Task Dispatcher]
       │
       ▼  (Payload Signatures & Retries)
[Webhook Delivery Workers] ──► [Your Backend Endpoint]`}
          </pre>
        </section>

        {/* RPC Failover Broker */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} style={{ color: 'var(--color-secondary)' }} />
            RPC Failover Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            If the primary node provider (e.g. Alchemy) returns rate-limiting responses, latency spikes, or connections drop, requests are re-routed to standby providers instantly without dropping tasks.
          </p>
          <div className="cyber-card" style={{ padding: '16px', background: 'rgba(0,255,102,0.02)', border: '1px solid var(--color-primary-border)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Failover SLA Guarantee</span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  By keeping active connections to Alchemy, Chainstack, and public backup RPC clusters, ChainPulse guarantees 99.99% ingestion reliability.
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
            <div className="terminal-title">RPC Cluster Monitoring</div>
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
                <Play size={12} /> {isLoadingTerminal ? 'Executing...' : 'Check Health'}
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
