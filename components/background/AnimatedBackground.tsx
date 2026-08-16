export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden z-0 absolute"
      style={{
        background:
          "radial-gradient(120% 90% at 95% 95%, #6d3df5 0%, #3b1d8a 28%, #1a0f3d 60%, #0e0824 100%)",
      }}
    >
      {/* Soft glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "70vmax",
          height: "70vmax",
          right: "-15vmax",
          bottom: "-20vmax",
          background:
            "radial-gradient(circle, rgba(169,139,255,0.45) 0%, rgba(109,61,245,0.25) 35%, rgba(14,8,36,0) 70%)",
          filter: "blur(40px)",
          animation: "vega-drift 18s ease-in-out infinite",
        }}
      />

      {/* Secondary subtle glow top-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: "55vmax",
          height: "55vmax",
          left: "-20vmax",
          top: "-20vmax",
          background:
            "radial-gradient(circle, rgba(59,29,138,0.35) 0%, rgba(14,8,36,0) 70%)",
          filter: "blur(50px)",
          animation: "vega-drift-2 22s ease-in-out infinite",
        }}
      />

      {/* Light curves */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vega-curve" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a98bff" stopOpacity="0" />
            <stop offset="50%" stopColor="#c9b3ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a98bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g
          style={{
            filter: "blur(1px)",
            animation: "vega-pulse 12s ease-in-out infinite",
          }}
        >
          <path
            d="M -100 720 Q 500 300 1700 -50"
            fill="none"
            stroke="url(#vega-curve)"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <path
            d="M -100 900 Q 700 500 1700 150"
            fill="none"
            stroke="url(#vega-curve)"
            strokeWidth="1"
            opacity="0.35"
          />
          <path
            d="M -100 1050 Q 900 700 1700 350"
            fill="none"
            stroke="url(#vega-curve)"
            strokeWidth="0.8"
            opacity="0.25"
          />
        </g>
      </svg>
    </div>
  );
}