'use client';

import React, { useState } from 'react';
import { Check, Copy, Play, Database, Layers, Radio } from 'lucide-react';

export default function BlockEventsDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'go' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoadingTerminal, setIsLoadingTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const codeTemplates = {
    curl: `# Fetch latest verified Transfer events on BSC
curl -X GET "https://api.chainpulse.io/v1/events?chain=bsc&event=Transfer" \\
  -H "X-API-Key: cp_live_83b17df082a4d9..." \\
  -H "Content-Type: application/json"`,
    nodejs: `// Fetch block events in Node.js
import { ChainPulse } from 'chainpulse-node';

const pulse = new ChainPulse({ apiKey: 'cp_live_83b17df082a4d9...' });

const events = await pulse.events.list({
  chain: 'bsc',
  event: 'Transfer',
  limit: 5
});
console.log('Synchronized events:', events.length);`,
    go: `// Fetch block events in Go
package main

import (
	"context"
	"fmt"
	"github.com/tobisamuel/chainpulse-go"
)

func main() {
	client := chainpulse.NewClient("cp_live_83b17df082a4d9...")
	events, _ := client.Events.List(context.Background(), chainpulse.EventParams{
		Chain: "bsc",
		Event: "Transfer",
		Limit: 5,
	})
	fmt.Printf("Retrieved %d blockchain events\\n", len(events))
}`,
    python: `# Fetch block events in Python
from chainpulse import ChainPulse

client = ChainPulse(api_key="cp_live_83b17df082a4d9...")

events = client.events.list(
    chain="bsc",
    event="Transfer",
    limit=5
)
for event in events:
    print(f"Hash: {event['transaction_hash']} - Block: {event['block_number']}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTerminalSimulation = () => {
    setIsLoadingTerminal(true);
    setTerminalOutput(`$ Pulling blockchain event feed...
> Ingestion Network: BSC Mainnet
> Event Type Filter: Transfer [ERC-20]
> Loading confirmations count...`);

    setTimeout(() => {
      setTerminalOutput((prev) => prev + `\n> Events loaded. Status code: [200 OK]
> Displaying latest synchronized events (1 match found):

` + JSON.stringify({
  status: "success",
  code: 200,
  data: {
    chain: "bsc",
    contract: "0x55d398326f99059fF775485246999027B3197955",
    events: [
      {
        id: "evt_3928a4c10df89",
        chain: "bsc",
        block_number: 39285124,
        transaction_hash: "0x39a1c8f1e8a93cb02a014902b3dfbc8e0da4d93cb0179a32c028ba1204d8124b",
        event_name: "Transfer",
        log_index: 12,
        emitter_address: "0x55d398326f99059ff775485246999027b3197955",
        confirmations: 18,
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000e2130dfa5c789cb02a014902b3dfbc8e0da4d93c",
          "0x00000000000000000000000014798a3ca5c789cb02a014902b3dfbc8e0da4d93"
        ],
        data: "0x0000000000000000000000000000000000000000000000186a04b77f43c80000",
        decoded_values: {
          from: "0xe2130dfa5c789cb02a014902b3dfbc8e0da4d93c",
          to: "0x14798a3ca5c789cb02a014902b3dfbc8e0da4d93",
          value: "450.000000 USDT"
        },
        synchronized_at: new Date().toISOString()
      }
    ]
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
            <Database size={12} /> Block Data
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Block Events API
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            ChainPulse queries and indexes block events on EVM and non-EVM chains. You can filter events by chain, contract address, log topic, and confirmation count.
          </p>
        </section>

        {/* Data Schema */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--color-secondary)' }} />
            Event Schema
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#fff' }}>
                <th style={{ padding: '10px 0' }}>Property</th>
                <th style={{ padding: '10px 0' }}>Type</th>
                <th style={{ padding: '10px 0' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>chain</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>string</td>
                <td style={{ padding: '10px 0' }}>Target chain, e.g. <code style={{ color: 'var(--color-primary)' }}>bsc</code>, <code style={{ color: 'var(--color-secondary)' }}>ethereum</code>.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>block_number</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>uint64</td>
                <td style={{ padding: '10px 0' }}>The blockchain height at which the event occurred.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>transaction_hash</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>string</td>
                <td style={{ padding: '10px 0' }}>Hexadecimal transaction hash string.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>decoded_values</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>object</td>
                <td style={{ padding: '10px 0' }}>Parsed event arguments matching the contract ABI definition.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>confirmations</td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)' }}>uint32</td>
                <td style={{ padding: '10px 0' }}>Number of blocks built on top of this event.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Real-time sync */}
        <section style={{ marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} style={{ color: 'var(--color-primary)' }} />
            Real-time Ingestion Confirmation
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            ChainPulse tracks block events immediately on block mint. Events will trigger webhook execution as soon as they reach the confirmation threshold specified in your webhook config (e.g. 1 block for fast confirmation, 15 blocks for finalized settlement safety).
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
            <div className="terminal-title">Event Data Stream Reader</div>
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
                <Play size={12} /> {isLoadingTerminal ? 'Fetching...' : 'Get Event Log'}
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
