"use client";

import React from "react";

interface SalonLoaderProps {
  size?: number; // px, default 120
}

export default function SalonLoader({ size = 120 }: SalonLoaderProps) {
  const s = size;
  const center = s / 2;
  const r1 = s * 0.46; // outer ring radius
  const r2 = s * 0.34; // inner ring radius

  return (
    <>
      <style>{`
        @keyframes salon-spin        { to { transform: rotate(360deg); } }
        @keyframes salon-spin-rev    { to { transform: rotate(-360deg); } }
        @keyframes salon-snip {
          0%,100% { transform: rotate(-8deg) scale(1); }
          50%     { transform: rotate(8deg)  scale(1.05); }
        }
        @keyframes salon-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes salon-pulse {
          0%,100% { opacity: 1;   transform: scale(1);    }
          50%     { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: s,
          height: s,
          flexShrink: 0,
        }}
      >
        {/* ── SVG rings ── */}
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Ghost track */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="rgba(201,169,110,0.12)"
            strokeWidth="1"
          />
          {/* Inner ghost track */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="rgba(201,169,110,0.07)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </svg>

        {/* ── Spinning outer arc ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1.5px solid transparent`,
            borderTopColor: "#c9a96e",
            borderRightColor: "rgba(201,169,110,0.35)",
            animation: "salon-spin 2s cubic-bezier(0.68,-0.55,0.27,1.55) infinite",
          }}
        />

        {/* ── Spinning inner dashed ring (reverse) ── */}
        <div
          style={{
            position: "absolute",
            inset: s * 0.13,
            borderRadius: "50%",
            border: "1px dashed rgba(201,169,110,0.18)",
            animation: "salon-spin-rev 4s linear infinite",
          }}
        />

        {/* ── Orbiting glowing dot ── */}
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            animation: "salon-orbit 2s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: "50%",
              transform: "translateX(-50%)",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#c9a96e",
              boxShadow: "0 0 10px #c9a96e, 0 0 4px #fff",
            }}
          />
        </div>

        {/* ── Scissors icon ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width={s * 0.36}
            height={s * 0.36}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: "drop-shadow(0 0 7px rgba(201,169,110,0.5))",
              animation: "salon-snip 2s ease-in-out infinite",
              transformOrigin: "50% 58%",
            }}
          >
            {/* Blade top */}
            <path d="M12 8 Q20 16 32 32"  stroke="#c9a96e" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M20 4 Q24 16 32 32"  stroke="#c9a96e" strokeWidth="2.4" strokeLinecap="round"/>
            {/* Blade bottom */}
            <path d="M12 56 Q20 48 32 32" stroke="#c9a96e" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M20 60 Q24 48 32 32" stroke="#c9a96e" strokeWidth="2.4" strokeLinecap="round"/>
            {/* Handle rings */}
            <circle cx="14" cy="10" r="6" stroke="#c9a96e" strokeWidth="1.8"/>
            <circle cx="14" cy="54" r="6" stroke="#c9a96e" strokeWidth="1.8"/>
            {/* Pivot */}
            <circle cx="32" cy="32" r="3" fill="#c9a96e"/>
            {/* Tail */}
            <path d="M32 32 L54 24" stroke="#c9a96e" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M32 32 L54 40" stroke="#c9a96e" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* ── Centre pulse glow ── */}
        <div
          style={{
            position: "absolute",
            inset: "38%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%)",
            animation: "salon-pulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   USAGE EXAMPLES
   ─────────────────────────────────────────────

   // Default size (120 px)
   <SalonLoader />

   // Custom size
   <SalonLoader size={80} />
   <SalonLoader size={160} />

   // Centred full-screen overlay
   <div style={{
     position: "fixed", inset: 0,
     background: "#1a1410",
     display: "flex", alignItems: "center", justifyContent: "center",
     zIndex: 50,
   }}>
     <SalonLoader size={120} />
   </div>

   ───────────────────────────────────────────── */