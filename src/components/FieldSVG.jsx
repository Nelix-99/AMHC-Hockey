// Purely decorative top-down field hockey pitch. viewBox="0 0 300 500".
// Interactive overlays are rendered separately in Lineup.jsx.
export default function FieldSVG() {
  return (
    <svg
      viewBox="0 0 300 500"
      className="w-full h-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Outer background */}
      <rect width="300" height="500" fill="#1a5c30" />

      {/* Main field */}
      <rect x="10" y="20" width="280" height="460" fill="#22863a" />

      {/* Alternating grass stripes */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x="10" y={20 + i * 51.1} width="280" height="25.5" fill="#249140" opacity="0.45" />
      ))}

      {/* Field border */}
      <rect x="10" y="20" width="280" height="460" fill="none" stroke="white" strokeWidth="2" />

      {/* Center line */}
      <line x1="10" y1="250" x2="290" y2="250" stroke="white" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="150" cy="250" r="28" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="150" cy="250" r="2" fill="white" />

      {/* 23-metre lines */}
      <line x1="10" y1="145" x2="290" y2="145" stroke="white" strokeWidth="1.5" />
      <line x1="10" y1="355" x2="290" y2="355" stroke="white" strokeWidth="1.5" />

      {/* Shooting circles (D areas) — arcs into field */}
      {/* Top D: centered at (150,20), arc sweeps into field (clockwise) */}
      <path d="M 72 20 A 78 78 0 0 1 228 20" fill="none" stroke="white" strokeWidth="2" />
      {/* Bottom D: centered at (150,480), arc sweeps into field (counter-clockwise) */}
      <path d="M 72 480 A 78 78 0 0 0 228 480" fill="none" stroke="white" strokeWidth="2" />

      {/* Penalty spots */}
      <circle cx="150" cy="58" r="2.5" fill="white" />
      <circle cx="150" cy="442" r="2.5" fill="white" />

      {/* Goals (top and bottom) */}
      <rect x="132" y="5" width="36" height="17" fill="none" stroke="white" strokeWidth="2" />
      <rect x="132" y="478" width="36" height="17" fill="none" stroke="white" strokeWidth="2" />

      {/* Opponent label */}
      <text x="150" y="13" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="sans-serif">
        OPPONENT
      </text>
      {/* Our goal label */}
      <text x="150" y="497" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="sans-serif">
        OUR GOAL
      </text>
    </svg>
  )
}
