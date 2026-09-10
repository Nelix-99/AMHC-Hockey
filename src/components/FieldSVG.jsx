import { TEAM_NAME, AMHC_LOGO_URL } from '../utils/positions'

// Top-down field hockey pitch. viewBox="0 0 300 500".
// The pitch itself sits at x 10–290, y 30–470; the 30-unit bands above and
// below hold the goals and the end-zone labels, so nothing overlaps the play
// area or the rounded corners of the container.
// Interactive overlays are rendered separately in Lineup.jsx.
export default function FieldSVG() {
  return (
    <svg
      viewBox="0 0 300 500"
      className="w-full h-full"
      style={{ display: 'block' }}
      role="img"
      aria-label={`Speelveld: onze goal (AMHC ${TEAM_NAME}) onderaan, doel van de tegenstander bovenaan.`}
    >
      {/* Outer background */}
      <rect width="300" height="500" fill="#1a5c30" />

      {/* Main field */}
      <rect x="10" y="30" width="280" height="440" fill="#22863a" />

      {/* Alternating grass stripes */}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x="10" y={30 + i * 48.9} width="280" height="24.4" fill="#249140" opacity="0.45" />
      ))}

      {/* Field border */}
      <rect x="10" y="30" width="280" height="440" fill="none" stroke="white" strokeWidth="2" />

      {/* Center line */}
      <line x1="10" y1="250" x2="290" y2="250" stroke="white" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="150" cy="250" r="28" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="150" cy="250" r="2" fill="white" />

      {/* 23-metre lines */}
      <line x1="10" y1="140" x2="290" y2="140" stroke="white" strokeWidth="1.5" />
      <line x1="10" y1="360" x2="290" y2="360" stroke="white" strokeWidth="1.5" />

      {/* Shooting circles (D areas) — arcs bulge into the field, away from the backline */}
      {/* Top D: centered at (150,30), sweeps down to (150,106) */}
      <path d="M 74 30 A 76 76 0 0 0 226 30" fill="none" stroke="white" strokeWidth="2" />
      {/* Bottom D: centered at (150,470), sweeps up to (150,394) */}
      <path d="M 74 470 A 76 76 0 0 1 226 470" fill="none" stroke="white" strokeWidth="2" />

      {/* Penalty spots */}
      <circle cx="150" cy="61" r="2.5" fill="white" />
      <circle cx="150" cy="439" r="2.5" fill="white" />

      {/* Opponent goal — sits flush behind the backline */}
      <rect x="126" y="8" width="48" height="22" rx="1" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="2" />

      {/* Our goal, marked with the club crest so the home end is unmistakable */}
      <rect x="126" y="470" width="48" height="22" rx="1" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="2" />
      <image
        href={AMHC_LOGO_URL}
        x="141"
        y="472"
        width="18"
        height="18"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* End-zone labels — offset from the goals so the two never collide */}
      <g fill="rgba(255,255,255,0.62)" fontFamily="sans-serif" fontSize="9" fontWeight="600" letterSpacing="0.6">
        {/* Attacking direction + opponent end */}
        <path d="M 20 11 L 25 19 L 15 19 Z" fill="rgba(255,255,255,0.62)" />
        <text x="30" y="19">TEGENSTANDER</text>
        {/* Home end */}
        <text x="16" y="488">{`AMHC ${TEAM_NAME}`.toUpperCase()}</text>
      </g>
    </svg>
  )
}
