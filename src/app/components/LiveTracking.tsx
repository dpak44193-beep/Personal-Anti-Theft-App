import { useState, useEffect } from "react";
import { MapPin, Navigation, Clock, Wifi, Battery, Zap, RefreshCw, History } from "lucide-react";

const locationHistory = [
  { id: 1, address: "47 Westfield Ave, Brooklyn", lat: "40.6501° N", lng: "73.9496° W", time: "Now", type: "current" },
  { id: 2, address: "Grand Central Terminal, NYC", lat: "40.7527° N", lng: "73.9772° W", time: "2h 14min ago", type: "transit" },
  { id: 3, address: "Midtown Office — 44th St", lat: "40.7549° N", lng: "73.9840° W", time: "5h 33min ago", type: "work" },
  { id: 4, address: "Home Zone — Bedford-Stuyvesant", lat: "40.6826° N", lng: "73.9442° W", time: "Yesterday 22:47", type: "home" },
];

interface MapDotProps {
  x: number;
  y: number;
  color: string;
  label?: string;
  pulsing?: boolean;
}

function MapDot({ x, y, color, label, pulsing }: MapDotProps) {
  return (
    <g>
      {pulsing && (
        <>
          <circle cx={x} cy={y} r="16" fill={color} opacity="0.06">
            <animate attributeName="r" from="10" to="22" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.15" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r="10" fill={color} opacity="0.12">
            <animate attributeName="r" from="6" to="14" dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.2" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <circle cx={x} cy={y} r="5" fill={color} />
      <circle cx={x} cy={y} r="3" fill="#070B14" />
      <circle cx={x} cy={y} r="1.5" fill={color} />
      {label && (
        <text x={x + 9} y={y + 4} fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace">{label}</text>
      )}
    </g>
  );
}

export function LiveTracking() {
  const [tracking, setTracking] = useState(true);
  const [interval, setIntervalState] = useState(30);
  const [lastUpdate, setLastUpdate] = useState("Just now");

  useEffect(() => {
    if (!tracking) return;
    const timer = setInterval(() => setLastUpdate("Just now"), interval * 1000);
    return () => clearInterval(timer);
  }, [tracking, interval]);

  return (
    <div className="flex h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "#060A12" }}>
        {/* Simulated Map SVG */}
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {/* Grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 30} x2="800" y2={i * 30} stroke="#00D4FF" strokeOpacity="0.04" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 27 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="600" stroke="#00D4FF" strokeOpacity="0.04" strokeWidth="0.5" />
          ))}

          {/* City blocks */}
          {[
            [60, 80, 140, 90], [240, 60, 100, 80], [400, 50, 160, 100], [600, 70, 120, 110],
            [60, 220, 120, 80], [220, 210, 180, 90], [450, 200, 130, 100], [630, 190, 120, 80],
            [80, 360, 100, 90], [230, 350, 150, 100], [430, 340, 170, 90], [650, 360, 110, 80],
            [60, 480, 130, 80], [240, 470, 110, 90], [410, 480, 150, 80], [610, 460, 130, 100],
          ].map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="#0C1828"
              stroke="#00D4FF"
              strokeOpacity="0.08"
              strokeWidth="0.5"
              rx="2"
            />
          ))}

          {/* Roads */}
          <line x1="0" y1="190" x2="800" y2="190" stroke="#1A2B3C" strokeWidth="8" />
          <line x1="0" y1="330" x2="800" y2="330" stroke="#1A2B3C" strokeWidth="8" />
          <line x1="0" y1="460" x2="800" y2="460" stroke="#1A2B3C" strokeWidth="5" />
          <line x1="200" y1="0" x2="200" y2="600" stroke="#1A2B3C" strokeWidth="8" />
          <line x1="400" y1="0" x2="400" y2="600" stroke="#1A2B3C" strokeWidth="8" />
          <line x1="620" y1="0" x2="620" y2="600" stroke="#1A2B3C" strokeWidth="5" />

          {/* Route trace */}
          <polyline
            points="680,120 580,190 400,190 400,330 300,330 300,420"
            fill="none"
            stroke="#00D4FF"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeDasharray="6,4"
          />

          {/* Past locations */}
          <MapDot x={680} y={120} color="#39FF14" label="Office" />
          <MapDot x={580} y={200} color="#00D4FF" label="Transit" />
          <MapDot x={400} y={270} color="#00D4FF" label="" />

          {/* Current location */}
          <MapDot x={300} y={420} color="#FF3355" label="HERE" pulsing />
        </svg>

        {/* Overlay top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(7,11,20,0.85)", border: "1px solid rgba(0,212,255,0.2)", backdropFilter: "blur(8px)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: tracking ? "#39FF14" : "#FF3355", boxShadow: `0 0 6px ${tracking ? "#39FF14" : "#FF3355"}` }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: tracking ? "#39FF14" : "#FF3355" }}>
              {tracking ? "LIVE TRACKING" : "PAUSED"}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>
              · Updated {lastUpdate}
            </span>
          </div>
          <button
            onClick={() => setTracking((t) => !t)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{
              background: tracking ? "rgba(255,51,85,0.15)" : "rgba(0,212,255,0.15)",
              border: `1px solid ${tracking ? "#FF335540" : "#00D4FF40"}`,
              backdropFilter: "blur(8px)",
              color: tracking ? "#FF3355" : "#00D4FF",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tracking ? "Pause Tracking" : "Resume Tracking"}
          </button>
        </div>

        {/* Coordinate overlay */}
        <div className="absolute bottom-4 left-4 px-3 py-2 rounded-lg" style={{ background: "rgba(7,11,20,0.85)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(8px)" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginBottom: 2 }}>CURRENT COORDINATES</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#00D4FF" }}>
            40.6501° N · 73.9496° W
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>
            Accuracy: ±4m · Alt: 32m
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 flex flex-col shrink-0 overflow-y-auto" style={{ background: "#080E1A", borderLeft: "1px solid rgba(0,212,255,0.1)" }}>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>Live Tracking</h2>
          <p style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Pixel 8 Pro — James Davidson</p>
        </div>

        {/* Device Stats */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {[
            { icon: Wifi, label: "Signal", value: "5G", color: "#39FF14" },
            { icon: Battery, label: "Battery", value: "87%", color: "#00D4FF" },
            { icon: Zap, label: "Speed", value: "4 km/h", color: "#FF9F00" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-lg p-2.5" style={{ background: "#0C1322", border: "1px solid rgba(0,212,255,0.1)" }}>
              <Icon size={13} style={{ color, marginBottom: 4 }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color, fontWeight: 600 }}>{value}</div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Update Interval */}
        <div className="px-4 pb-4">
          <div className="rounded-lg p-3" style={{ background: "#0C1322", border: "1px solid rgba(0,212,255,0.1)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw size={12} style={{ color: "#00D4FF" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>Update Interval</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#00D4FF" }}>{interval}s</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={10}
              value={interval}
              onChange={(e) => setIntervalState(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#00D4FF" }}
            />
            <div className="flex justify-between mt-1">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748B" }}>10s</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748B" }}>2min</span>
            </div>
          </div>
        </div>

        {/* Location History */}
        <div className="px-4" style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
          <div className="flex items-center gap-2 py-3">
            <History size={13} style={{ color: "#00D4FF" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}>Location History</span>
          </div>
          <div className="space-y-1 pb-4">
            {locationHistory.map((loc, i) => (
              <div
                key={loc.id}
                className="rounded-lg p-3 cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  background: loc.type === "current" ? "rgba(0,212,255,0.06)" : "#0C1322",
                  border: `1px solid ${loc.type === "current" ? "rgba(0,212,255,0.25)" : "rgba(0,212,255,0.08)"}`,
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: loc.type === "current" ? "#FF3355" : i === 1 ? "#00D4FF" : "#39FF14",
                        boxShadow: loc.type === "current" ? "0 0 8px #FF3355" : "none",
                      }}
                    />
                    {i < locationHistory.length - 1 && (
                      <div className="w-px h-4 ml-[3px] mt-1" style={{ background: "rgba(0,212,255,0.15)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>{loc.address}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748B", marginTop: 1 }}>
                      {loc.lat} · {loc.lng}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={9} style={{ color: "#64748B" }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: loc.type === "current" ? "#00D4FF" : "#64748B" }}>
                        {loc.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
