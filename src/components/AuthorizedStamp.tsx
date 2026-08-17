"use client";

import React from "react";

interface AuthorizedStampProps {
  receiptNumber?: string;
  date?: string;
  receiverName?: string;
  className?: string;
}

export default function AuthorizedStamp({
  receiptNumber,
  date,
  receiverName = "Faraz",
  className = "",
}: AuthorizedStampProps) {
  return (
    <div
      className={`absolute z-20 pointer-events-none select-none ${className}`}
      style={{
        transform: "rotate(-12deg)",
        mixBlendMode: "multiply",
      }}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 200 200"
        className="w-40 h-40 sm:w-48 sm:h-48 filter drop-shadow-xs opacity-95"
      >
        <defs>
          {/* Top Arc Path for EXTREME FIBER OPTICAL NETWORK (Sweeps left to right over top) */}
          <path
            id="stampArcTop"
            d="M 22,100 A 78,78 0 0,1 178,100"
            fill="none"
          />
          {/* Bottom Arc Path for JHELUM CANTT (Sweeps right to left along bottom so text stands UPRIGHT at the bottom) */}
          <path
            id="stampArcBottom"
            d="M 174,100 A 74,74 0 0,1 26,100"
            fill="none"
          />
        </defs>

        {/* Outer Rope / Distressed Double Border */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="#1e40af"
          strokeWidth="3.5"
          strokeDasharray="6 2.5"
        />
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#1e40af"
          strokeWidth="1.5"
        />

        {/* Inner Circle Border */}
        <circle
          cx="100"
          cy="100"
          r="63"
          fill="none"
          stroke="#1e40af"
          strokeWidth="1.5"
        />

        {/* Circular Top Text: EXTREME FIBER OPTICAL NETWORK */}
        <text
          fill="#1e40af"
          fontSize="11"
          fontWeight="900"
          letterSpacing="1.2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
            EXTREME FIBER OPTICAL NETWORK
          </textPath>
        </text>

        {/* Circular Bottom Text: JHELUM CANTT (Clearly visible in bottom outer ring band) */}
        <text
          fill="#1e40af"
          fontSize="14"
          fontWeight="900"
          letterSpacing="3"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">
            JHELUM CANTT
          </textPath>
        </text>

        {/* Center Handwritten Cursive Signature "Faraz" */}
        <text
          x="100"
          y="76"
          textAnchor="middle"
          fill="#1e40af"
          fontSize="44"
          fontFamily="'Dancing Script', 'Brush Script MT', 'Caveat', 'Segoe Script', cursive"
          fontWeight="bold"
          fontStyle="italic"
        >
          Faraz
        </text>

        {/* Center Subtext 1: OFFICE OF AUTHORIZED RECEIVER */}
        <text
          x="100"
          y="98"
          textAnchor="middle"
          fill="#1e40af"
          fontSize="8.2"
          fontWeight="800"
          letterSpacing="0.4"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          OFFICE OF AUTHORIZED RECEIVER
        </text>

        {/* Center Subtext 2: OFFICE SUPPORT */}
        <text
          x="100"
          y="117"
          textAnchor="middle"
          fill="#1e40af"
          fontSize="13.5"
          fontWeight="900"
          letterSpacing="0.9"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          OFFICE SUPPORT
        </text>

        {/* Dynamic Overlaid Receipt Data inside inner circle */}
        {receiptNumber && (
          <text
            x="100"
            y="134"
            textAnchor="middle"
            fill="#1d4ed8"
            fontSize="7.5"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {receiptNumber} {date ? `• ${date}` : ""}
          </text>
        )}
      </svg>
    </div>
  );
}
