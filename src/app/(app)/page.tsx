'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import {
  Activity,
  Terminal,
  Code,
  Copy,
  Check,
  ExternalLink,
  Server,
  Radio,
  Clock,
  ArrowRight,
  ChevronDown,
  Layers,
  Lock,
  Shield,
  Zap,
  Database,
  Network,
  Cpu,
  BookOpen,
  Workflow,
  RefreshCw,
  Play,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ChainInfo {
  name: string;
  symbol: string;
  blockHeight: number;
  latency: number;
  status: 'active' | 'degraded' | 'offline';
  provider: string;
}

export default function Home() {
  // Live Webhook Ingestion Engine States
  const [activeChains, setActiveChains] = useState<string[]>(['bsc', 'eth', 'tron', 'solana']);
  const [simulationLogs, setSimulationLogs] = useState<Array<{ id: string; time: string; type: 'INGEST' | 'ROUTE' | 'DELIVER'; text: string; status?: 'success' | 'warning' | 'info' }>>([]);
  const [isLoadSpike, setIsLoadSpike] = useState(false);
  const [activeFlowLine, setActiveFlowLine] = useState<{ source: string; dest: number } | null>(null);

  // Blockchain Live Status States
  const [chains, setChains] = useState<Record<string, ChainInfo>>({
    bsc: { name: 'Binance Smart Chain', symbol: 'BSC', blockHeight: 39285124, latency: 22, status: 'active', provider: 'Alchemy + Ankr' },
    eth: { name: 'Ethereum Mainnet', symbol: 'ETH', blockHeight: 20123456, latency: 18, status: 'active', provider: 'Alchemy + Primary Node' },
    tron: { name: 'TRON Mainnet', symbol: 'TRX', blockHeight: 62912408, latency: 41, status: 'active', provider: 'TronGrid + Shasta' },
    solana: { name: 'Solana Mainnet', symbol: 'SOL', blockHeight: 280192304, latency: 8, status: 'active', provider: 'Helius + Custom RPC' },
    bitcoin: { name: 'Bitcoin Mainnet', symbol: 'BTC', blockHeight: 848124, latency: 108, status: 'active', provider: 'Blockstream + Self-Host' },
  });

  // Dynamic Live Stats Counter States
  const [eventCount, setEventCount] = useState(152438910);
  const [avgLatency, setAvgLatency] = useState(12.4);

  // Pricing Interval State
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // FAQ Active State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulated Live Update Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Increment total event count
      setEventCount((prev) => prev + Math.floor(Math.random() * 5) + 1);

      // 2. Adjust global average latency slightly
      setAvgLatency((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return parseFloat(Math.min(Math.max(prev + delta, 11.8), 13.2).toFixed(1));
      });

      // 3. Update blockchain heights and latencies
      setChains((prev) => {
        const next = { ...prev };
        
        // BSC updates every ~3s
        if (Math.random() > 0.4) {
          next.bsc = {
            ...next.bsc,
            blockHeight: next.bsc.blockHeight + 1,
            latency: Math.floor(20 + Math.random() * 6),
          };
        }
        // ETH updates every ~12s (lower probability per tick)
        if (Math.random() > 0.85) {
          next.eth = {
            ...next.eth,
            blockHeight: next.eth.blockHeight + 1,
            latency: Math.floor(16 + Math.random() * 4),
          };
        }
        // Tron updates every ~3s
        if (Math.random() > 0.4) {
          next.tron = {
            ...next.tron,
            blockHeight: next.tron.blockHeight + 1,
            latency: Math.floor(38 + Math.random() * 8),
          };
        }
        // Solana updates slots very fast
        next.solana = {
          ...next.solana,
          blockHeight: next.solana.blockHeight + Math.floor(Math.random() * 2) + 1,
          latency: Math.floor(6 + Math.random() * 4),
        };
        // BTC latency updates occasionally
        if (Math.random() > 0.9) {
          next.bitcoin = {
            ...next.bitcoin,
            latency: Math.floor(100 + Math.random() * 15),
          };
        }

        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Simulated Webhook Pipeline Logs
  useEffect(() => {
    // Initial logs
    setSimulationLogs([
      { id: 'init1', time: new Date().toLocaleTimeString(), type: 'INGEST', text: '[BSC] Listener attached to USDT contract', status: 'success' },
      { id: 'init2', time: new Date().toLocaleTimeString(), type: 'ROUTE', text: '[ETH] Route established for Uniswap V3 Pool', status: 'success' },
      { id: 'init3', time: new Date().toLocaleTimeString(), type: 'DELIVER', text: '[SOL] Payload delivered to client endpoint', status: 'success' },
    ]);
  }, []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const logTypes: ('INGEST' | 'ROUTE' | 'DELIVER')[] = ['INGEST', 'ROUTE', 'DELIVER'];
      const chainsList = ['BSC', 'ETH', 'TRX', 'SOL'];
      const actions = [
        'Transfer of 12,500.00 USDT detected',
        'ERC20 Approval event parsed',
        'Failover trigger: primary node degraded, switching to fallback',
        'Webhook payload signed via HMAC-SHA256',
        'Requeued failed webhook for retry attempt #1',
        'Dispatched payload to consumer webhook endpoint',
        'Swap event detected: 4.2 ETH for 14,200 USDC',
        'Sync block height matched contract filter',
        'Rate limit hit on primary RPC, routing via secondary RPC provider',
        'Transaction confirmed on BSC Mainnet: 0x123...abc (57 blocks)',
        'RPC connection timeout detected`',
        'Falling back to secondary RPC provider',
        'Polling interval synchronization for TRX node',
        'Max retries (3/3) reached for webhook delivery',
        'Successfully synced Solana slot 284,392,104',
        'Price update fetched from ETH liquidity pool',
        'Replay attack mitigation: nonce verification passed',
        'Webhook endpoint returned 403 Forbidden, retrying',
        'Health check passed: ETH latency 120ms (via Infura)' 
      ];
      
      const randomChain = chainsList[Math.floor(Math.random() * chainsList.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
      
      const newLog = {
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString(),
        type: randomType,
        text: `[${randomChain}] ${randomAction}`,
        status: randomAction.includes('degraded') || randomAction.includes('failed') || randomAction.includes('limit') ? 'warning' as const : 'success' as const
      };
      
      setSimulationLogs(prev => [newLog, ...prev].slice(0, 10));
    }, isLoadSpike ? 500 : 2000);

    return () => clearInterval(logInterval);
  }, [isLoadSpike]);


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const faqs = [
    {
      q: "How does the RPC failover routing work under the hood?",
      a: "ChainPulse evaluates RPC health in real-time. If the primary provider (e.g. Alchemy) returns rate limits or errors, requests are instantly routed to secondary and extra fallbacks (Ankr, Chainstack, and public endpoints) in milliseconds, avoiding service interruption."
    },
    {
      q: "Is there support for non-EVM chains?",
      a: "Yes. In addition to high-throughput EVM layers like Binance Smart Chain (BSC) and Ethereum, ChainPulse includes dedicated ingest services for Solana mainnet, TRON, and Bitcoin monitoring."
    },
    {
      q: "How do I secure my webhook endpoints?",
      a: "All webhooks dispatched by our background workers are signed with an HMAC signature ('sha256=<hmac>') calculated over the raw JSON payload. Your tenant secret key is stored with AES-256 encryption."
    },
    {
      q: "What is the difference between sandbox and production keys?",
      a: "Sandbox environments allow you to test local webhooks over plain HTTP. Production keys strictly require HTTPS endpoints, run on dedicated Asynq worker clusters, and support custom webhook replay configurations."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* 1. Header Component */}
      <header style={{
        background: 'rgba(6, 7, 9, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Logo size={24} />

        <nav style={{ display: 'flex', gap: '24px' }}>
          <a href="#features" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Features</a>
          <a href="#networks" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Networks</a>
          <Link href="/docs" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>API Reference</Link>
          <a href="#pricing" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Pricing</a>
        </nav>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" className="cyber-btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
            Console login
          </Link>
          <Link href="/register" className="cyber-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
            Register API Key
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        padding: '80px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '48px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        zIndex: 10
      }} className="desktop-split-grid">
        <style jsx global>{`
          @media (min-width: 1024px) {
            .desktop-split-grid {
              grid-template-columns: 1.1fr 0.9fr !important;
              align-items: center;
              padding: 100px 24px !important;
            }
          }
        `}</style>
        
        {/* Hero Info */}
        <div style={{ textAlign: 'left' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--color-primary-glow)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: '9999px',
            padding: '6px 14px',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}>
            <Activity size={12} style={{ color: 'var(--color-primary)' }} className="animate-pulse-glow" />
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              v1.2.0 - Distributed Ingestion Ready
            </span>
          </div>

          <h1 style={{
            fontSize: '52px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: '1.05',
            marginBottom: '20px'
          }}>
            Scale Your Blockchain <span className="gradient-text-green">Webhooks</span> & <span className="gradient-text-cyan">Events</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '540px'
          }}>
            Enterprise-grade multi-tenant event monitoring and high-availability RPC failover broker. Ingest events directly from EVM layers, TRX, and SOL with zero downtime.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/register" className="cyber-btn" style={{ minWidth: '180px' }}>
              Create API Key <ArrowRight size={16} />
            </Link>
            <Link href="/docs" className="cyber-btn cyber-btn-secondary" style={{ minWidth: '180px' }}>
              Read API Docs
            </Link>
          </div>
        </div>

        {/* Hero Webhook Ingestion Engine Visualizer */}
        <div style={{ minWidth: 0 }} className="cyber-terminal glow-border-hover">
          <div className="terminal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="terminal-dots">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
            <div className="terminal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <Radio size={14} className="animate-pulse" style={{ color: 'var(--color-primary)' }} />
              Live Ingestion Pipeline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="cyber-badge cyber-badge-success" style={{ padding: '2px 6px', fontSize: '9px' }}>Active</span>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Network Nodes Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', padding: '16px' }}>
              {/* Left Column: Chain Sources */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['BSC', 'ETH', 'TRX', 'SOL'].map((c) => {
                  const isActive = activeChains.includes(c.toLowerCase());
                  return (
                    <div key={c} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: isActive ? 'rgba(0, 255, 102, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: isActive ? '1px solid var(--color-primary-border)' : '1px solid var(--border-color)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: isActive ? '#fff' : 'var(--text-muted)'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isActive ? 'var(--color-primary)' : 'var(--text-muted)'
                      }} className={isActive ? "animate-pulse" : ""} />
                      {c}
                    </div>
                  );
                })}
              </div>

              {/* Connecting Lines */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span className="animate-pulse" style={{ color: 'var(--color-primary)', fontSize: '14px', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>&gt;&gt;&gt;</span>
              </div>

              {/* Center: Ingest Core */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid var(--color-secondary-border)',
                padding: '12px',
                borderRadius: '8px',
                width: '100px',
                textAlign: 'center'
              }}>
                <Cpu size={24} style={{ color: 'var(--color-secondary)' }} className="animate-spin-slow" />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>FAILOVER</span>
                <span style={{ fontSize: '8px', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>9ms latency</span>
              </div>

              {/* Connecting Lines */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span className="animate-pulse" style={{ color: 'var(--color-secondary)', fontSize: '14px', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>&gt;&gt;&gt;</span>
              </div>

              {/* Right Column: Webhook Target */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                padding: '12px',
                borderRadius: '8px',
                width: '100px',
                textAlign: 'center'
              }}>
                <Server size={24} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>DISPATCH</span>
                <span style={{ fontSize: '8px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>200 OK</span>
              </div>
            </div>

            {/* Load Spike & Control Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsLoadSpike(!isLoadSpike)}
                  className={`cyber-btn ${isLoadSpike ? 'cyber-btn-danger' : 'cyber-btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '11px', height: 'auto' }}
                >
                  {isLoadSpike ? 'Disable Traffic Spike' : 'Simulate Traffic Spike'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isLoadSpike ? 'var(--color-danger)' : 'var(--color-primary)'
                }} className="animate-pulse" />
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: isLoadSpike ? 'var(--color-danger)' : 'var(--text-muted)'
                }}>
                  {isLoadSpike ? '180 req/sec (FAILOVER ACTIVE)' : '14 req/sec (NORMAL)'}
                </span>
              </div>
            </div>

            {/* Scrolling Logs Screen */}
            <div style={{
              background: '#04060b',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '12px',
              height: '200px',
              overflowY: 'hidden',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: '6px'
            }}>
              {simulationLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                  <span style={{
                    color: log.status === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginRight: '8px'
                  }}>
                    {log.text}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    {log.time}
                  </span>
                </div>
              ))}
              {simulationLogs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '80px' }}>
                  Awaiting block ingest events...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Real-Time Stats Bar */}
      <section style={{
        background: 'rgba(9, 13, 22, 0.6)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '32px 24px',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Event Logs</span>
            <span style={{ fontSize: '32px', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text-green">
              {formatNumber(eventCount)}
            </span>
          </div>

          {/* Card 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Avg Response Latency</span>
            <span style={{ fontSize: '32px', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {avgLatency}ms
            </span>
          </div>

          {/* Card 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Webhook Delivery Success</span>
            <span style={{ fontSize: '32px', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text-cyan">
              99.985%
            </span>
          </div>

          {/* Card 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Nodes Online</span>
            <span style={{ fontSize: '32px', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              5 / 5
            </span>
          </div>
        </div>
      </section>

      {/* 4. Blockchain Coverage Monitor */}
      <section id="networks" style={{ padding: '80px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', color: '#fff', textTransform: 'uppercase', marginBottom: '12px' }}>Real-time Network Status</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Direct low-latency RPC connections verified. Custom block tickers synchronized via our failover brokers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {Object.entries(chains).map(([key, chain]) => (
            <div
              key={key}
              className="cyber-card glow-border-hover"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: key === 'bsc' ? 'rgba(0, 255, 102, 0.1)' : 'rgba(0, 229, 255, 0.1)',
                  color: key === 'bsc' ? 'var(--color-primary)' : 'var(--color-secondary)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {chain.symbol}
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>{chain.name}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>RPC Cluster: {chain.provider}</span>
                </div>
              </div>

              {/* Block Height Ticker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Block height</span>
                  <span style={{ fontSize: '15px', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {formatNumber(chain.blockHeight)}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Latency</span>
                  <span style={{ fontSize: '15px', color: chain.latency > 80 ? 'var(--color-warning)' : 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {chain.latency}ms
                  </span>
                </div>

                {/* Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} className="animate-glow-pulse" />
                  <span className="cyber-badge cyber-badge-success">Operational</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Features Grid */}
      <section id="features" style={{
        background: 'rgba(9, 13, 22, 0.4)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '80px 24px',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '36px', color: '#fff', textTransform: 'uppercase', marginBottom: '12px' }}>Built For Speed & Isolation</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Engineered with reliability patterns to guarantee transaction events always hit your API server.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Box 1 */}
            <div className="cyber-card glow-border-hover">
              <div style={{
                background: 'var(--color-primary-glow)',
                border: '1px solid var(--color-primary-border)',
                padding: '12px',
                borderRadius: '8px',
                display: 'inline-flex',
                marginBottom: '20px'
              }}>
                <Cpu size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>High-Throughput Ingestion</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Synchronized daemon monitors scan blockchain block headers directly, extracting smart contract logs, coin transactions, and transfers with zero-latency buffer.
              </p>
            </div>

            {/* Box 2 */}
            <div className="cyber-card glow-border-hover">
              <div style={{
                background: 'var(--color-secondary-glow)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                padding: '12px',
                borderRadius: '8px',
                display: 'inline-flex',
                marginBottom: '20px'
              }}>
                <Lock size={24} style={{ color: 'var(--color-secondary)' }} />
              </div>
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Sandboxed Tenant Security</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Strict multi-tenant environments. Sign webhooks with a secure cryptographic key using HMAC signatures, ensuring incoming event payloads are verifiable and secure.
              </p>
            </div>

            {/* Box 3 */}
            <div className="cyber-card glow-border-hover">
              <div style={{
                background: 'rgba(255, 183, 0, 0.1)',
                border: '1px solid rgba(255, 183, 0, 0.2)',
                padding: '12px',
                borderRadius: '8px',
                display: 'inline-flex',
                marginBottom: '20px'
              }}>
                <RefreshCw size={24} style={{ color: 'var(--color-warning)' }} />
              </div>
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Automated Webhook Failover</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Backed by Asynq worker threads running over Redis. If a client endpoint is unreachable, requests back off exponentially with manual replay control in the Admin console.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Tiers */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', color: '#fff', textTransform: 'uppercase', marginBottom: '12px' }}>Developer Tiers</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Transparent, payload-based usage limits with no commitments.</p>
          
          {/* Interval Switch */}
          <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '9999px', padding: '4px' }}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              style={{
                background: billingPeriod === 'monthly' ? 'var(--color-primary)' : 'transparent',
                color: billingPeriod === 'monthly' ? 'var(--text-dark)' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              style={{
                background: billingPeriod === 'yearly' ? 'var(--color-primary)' : 'transparent',
                color: billingPeriod === 'yearly' ? 'var(--text-dark)' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Yearly (15% off)
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Sandbox Tier */}
          <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="cyber-badge cyber-badge-info" style={{ marginBottom: '16px' }}>Sandbox</span>
              <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>Free</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Perfect for prototyping and localized integrations.</p>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> 50,000 requests / month</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> EVM + TRX Testnets</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> HTTP Webhook payloads</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Max retry limit: 3 times</li>
              </ul>
            </div>
            <Link href="/register" className="cyber-btn cyber-btn-secondary" style={{ width: '100%', marginTop: '32px' }}>
              Get Free Key
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="cyber-card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--color-primary-border)',
            boxShadow: '0 0 20px var(--color-primary-glow)'
          }}>
            <div>
              <span className="cyber-badge cyber-badge-success" style={{ marginBottom: '16px' }}>Pro</span>
              <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>
                ${billingPeriod === 'monthly' ? '59' : '49'}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}> / month</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>For scaled blockchain infrastructure and production APIs.</p>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> 2,500,000 requests / month</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> All chains (Mainnet + Testnet)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Signed HTTPS endpoints</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Max retry limit: 10 times</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Custom replay console</li>
              </ul>
            </div>
            <Link href="/register" className="cyber-btn" style={{ width: '100%', marginTop: '32px' }}>
              Upgrade to Pro
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="cyber-badge cyber-badge-warning" style={{ marginBottom: '16px' }}>Custom</span>
              <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>Enterprise</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Custom contract, high availability, and dedicated support.</p>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Unlimited requests</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Dedicated RPC nodes</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> Custom webhook retries</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} style={{ color: 'var(--color-primary)' }} /> 99.99% SLA & 24/7 Support</li>
              </ul>
            </div>
            <a href="mailto:support@chainpulse.io" className="cyber-btn cyber-btn-secondary" style={{ width: '100%', marginTop: '32px' }}>
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section style={{
        background: 'rgba(9, 13, 22, 0.4)',
        borderTop: '1px solid var(--border-color)',
        padding: '80px 24px',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', color: '#fff', textTransform: 'uppercase', marginBottom: '12px' }}>FAQ</h2>
            <p style={{ color: 'var(--text-muted)' }}>Find answers to common developer questions.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} style={{ color: 'var(--color-primary)' }} />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: 'var(--text-muted)'
                    }}
                  />
                </button>

                {activeFaq === idx && (
                  <div style={{
                    padding: '0 20px 20px 20px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    borderTop: '1px solid rgba(255,255,255,0.02)'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer style={{
        background: '#060709',
        borderTop: '1px solid var(--border-color)',
        padding: '40px 24px',
        marginTop: 'auto',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} ChainPulse. All rights reserved. Built for distributed consensus event dispatching.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Status light */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 255, 102, 0.05)', border: '1px solid var(--color-primary-border)', padding: '6px 12px', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} className="animate-glow-pulse" />
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
