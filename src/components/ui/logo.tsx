'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  iconOnly?: boolean;
  size?: number;
  className?: string;
  glowColor?: 'green' | 'cyan' | 'both';
}

export default function Logo({
  iconOnly = false,
  size = 28,
  className = '',
  glowColor = 'both'
}: LogoProps) {
  const glowShadow = glowColor === 'green'
    ? '0 0 16px var(--color-primary-glow)'
    : glowColor === 'cyan'
    ? '0 0 16px var(--color-secondary-glow)'
    : '0 0 20px rgba(0, 255, 150, 0.25)';

  return (
    <Link
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        userSelect: 'none'
      }}
      className={`group ${className}`}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${size + 12}px`,
          height: `${size + 12}px`,
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: glowShadow,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="logo-icon-wrapper"
      >
        {/* Glowing aura underlay */}
        <div
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            opacity: 0.1,
            filter: 'blur(4px)',
            transition: 'opacity 0.3s ease'
          }}
          className="logo-glow-aura"
        />

        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="logo-svg"
        >
          <defs>
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 255, 102, 0.2)" />
              <stop offset="100%" stopColor="rgba(0, 229, 255, 0.2)" />
            </linearGradient>
          </defs>

          {/* Left Hexagonal Link */}
          <path
            d="M32 24 L14 42 L14 58 L32 76 M32 76 L40 68 L26 54 L26 46 L40 32 L32 24"
            stroke="url(#primaryGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Right Hexagonal Link */}
          <path
            d="M68 24 L86 42 L86 58 L68 76 M68 76 L60 68 L74 54 L74 46 L60 32 L68 24"
            stroke="url(#primaryGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Center Pulse Signal Wave */}
          <path
            d="M10 50 H36 L43 28 L51 72 L58 38 L63 56 L69 50 H90"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: '200',
              strokeDashoffset: '0',
            }}
            className="pulse-wave-line"
          />

          {/* Core Pulse Intersection Node */}
          <circle
            cx="63"
            cy="56"
            r="4"
            fill="var(--color-secondary)"
            className="pulse-node"
          />
        </svg>
      </div>

      {!iconOnly && (
        <span
          style={{
            color: '#fff',
            fontSize: `${size * 0.7 + 6}px`,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.3s ease'
          }}
          className="logo-text"
        >
          Chain
          <span
            style={{
              color: 'var(--color-primary)',
              marginLeft: '1px',
              transition: 'color 0.3s ease'
            }}
            className="logo-text-accent"
          >
            Pulse
          </span>
        </span>
      )}

      <style jsx>{`
        /* Hover Effects */
        .group:hover .logo-icon-wrapper {
          transform: translateY(-1px);
          border-color: rgba(0, 255, 102, 0.25);
          box-shadow: 0 0 25px rgba(0, 255, 102, 0.4);
          background: rgba(255, 255, 255, 0.04);
        }
        
        .group:hover .logo-glow-aura {
          opacity: 0.25;
        }

        .group:hover .logo-svg {
          transform: scale(1.05);
        }
        
        /* Pulse Animation Effects */
        @keyframes pulse-dash {
          to {
            stroke-dashoffset: -400;
          }
        }

        .pulse-wave-line {
          animation: pulse-dash 4s linear infinite;
          stroke-dasharray: 80 120;
        }
      `}</style>
    </Link>
  );
}
