"use client"

import * as React from "react"

function CircularProgress({ value = null, size = 96, strokeWidth = 8, className = "" }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const normalized = Math.max(0, Math.min(100, value || 0))
  const offset = circumference * (1 - normalized / 100)

  // If value is null or undefined, render an indeterminate spinner
  if (value === null || value === undefined) {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          className="animate-spin"
          style={{ width: size, height: size }}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeOpacity="0.15"
            stroke="currentColor"
            fill="none"
          />
          <path
            d={`M ${size / 2} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${size / 2 - 0.01} ${strokeWidth / 2}`}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeOpacity="0.12"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="var(--tw-ring-color, #0ea5e9)"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 300ms ease",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-sm font-medium">{Math.round(normalized)}%</span>
      </div>
    </div>
  )
}

export { CircularProgress }
