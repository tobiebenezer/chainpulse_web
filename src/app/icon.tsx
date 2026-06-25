import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#04060a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 102, 0.25)',
          position: 'relative',
        }}
      >
        {/* Glow backdrop inside the favicon */}
        <div
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'rgba(0, 255, 102, 0.2)',
            filter: 'blur(1px)',
          }}
        />
        
        {/* SVG Icon representing the ChainPulse logo mark */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Concentric rings */}
          <circle cx="12" cy="12" r="9" stroke="#00ff66" strokeWidth="1.5" strokeOpacity="0.2" />
          <circle cx="12" cy="12" r="5" stroke="#00ff66" strokeWidth="1.5" strokeOpacity="0.45" />
          
          {/* Heartbeat pulse path */}
          <path
            d="M3 12H7L9 7L12 17L14 9L16 14L17.5 12H21"
            stroke="#00ff66"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Central active core node */}
          <circle cx="12" cy="12" r="1.75" fill="#00e5ff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
