import { useState } from "react";
import { Camera, Download, Trash2, MapPin, Clock, Filter, Grid, List } from "lucide-react";

const photos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop&auto=format",
    type: "Front Camera",
    time: "Today 14:32:07",
    location: "47 Westfield Ave, Brooklyn",
    coords: "40.6501° N, 73.9496° W",
    device: "Pixel 8 Pro",
    triggered: "Manual",
    size: "2.4 MB",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=150&fit=crop&auto=format",
    type: "Front Camera",
    time: "Today 03:09:42",
    location: "Unknown Area",
    coords: "40.7127° N, 74.0059° W",
    device: "Pixel 8 Pro",
    triggered: "Failed Unlock",
    size: "1.8 MB",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=150&fit=crop&auto=format",
    type: "Front Camera",
    time: "Yesterday 22:45:18",
    location: "Grand Central, NYC",
    coords: "40.7527° N, 73.9772° W",
    device: "Samsung S24",
    triggered: "Manual",
    size: "3.1 MB",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=300&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=150&fit=crop&auto=format",
    type: "Front Camera",
    time: "Yesterday 18:22:55",
    location: "Midtown Office",
    coords: "40.7549° N, 73.9840° W",
    device: "Pixel 8 Pro",
    triggered: "SIM Change",
    size: "2.9 MB",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=150&fit=crop&auto=format",
    type: "Front Camera",
    time: "2 days ago 09:14:33",
    location: "Bedford-Stuyvesant",
    coords: "40.6826° N, 73.9442° W",
    device: "Pixel 8 Pro",
    triggered: "Manual",
    size: "2.2 MB",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=300&fit=crop&auto=format",
    thumb: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=150&fit=crop&auto=format",
    type: "Front Camera",
    time: "3 days ago 16:48:02",
    location: "Downtown Brooklyn",
    coords: "40.6928° N, 73.9903° W",
    device: "iPhone 15",
    triggered: "Failed Unlock",
    size: "1.6 MB",
  },
];

const triggerColors: Record<string, string> = {
  Manual: "#00D4FF",
  "Failed Unlock": "#FF3355",
  "SIM Change": "#FF9F00",
};

export function EvidenceVault() {
  const [selected, setSelected] = useState<typeof photos[0] | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterTrigger, setFilterTrigger] = useState("All");

  const triggers = ["All", "Manual", "Failed Unlock", "SIM Change"];
  const filtered = filterTrigger === "All" ? photos : photos.filter((p) => p.triggered === filterTrigger);

  return (
    <div className="flex h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0" }}>Evidence Vault</h1>
            <p style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#00D4FF" }}>{photos.length}</span> captures · Encrypted storage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#0F1A2E", border: "1px solid rgba(0,212,255,0.1)" }}>
              <button
                onClick={() => setViewMode("grid")}
                className="p-1.5 rounded transition-colors"
                style={{ background: viewMode === "grid" ? "rgba(0,212,255,0.15)" : "transparent", color: viewMode === "grid" ? "#00D4FF" : "#64748B" }}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-1.5 rounded transition-colors"
                style={{ background: viewMode === "list" ? "rgba(0,212,255,0.15)" : "transparent", color: viewMode === "list" ? "#00D4FF" : "#64748B" }}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 flex items-center gap-2 shrink-0" style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
          <Filter size={12} style={{ color: "#64748B" }} />
          {triggers.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTrigger(t)}
              className="px-2.5 py-1 rounded transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                background: filterTrigger === t ? (t === "Failed Unlock" ? "rgba(255,51,85,0.12)" : t === "SIM Change" ? "rgba(255,159,0,0.12)" : "rgba(0,212,255,0.12)") : "transparent",
                border: `1px solid ${filterTrigger === t ? (t === "Failed Unlock" ? "rgba(255,51,85,0.3)" : t === "SIM Change" ? "rgba(255,159,0,0.3)" : "rgba(0,212,255,0.3)") : "transparent"}`,
                color: filterTrigger === t ? (t === "Failed Unlock" ? "#FF3355" : t === "SIM Change" ? "#FF9F00" : "#00D4FF") : "#64748B",
                textTransform: "uppercase",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid / List */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {filtered.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelected(photo)}
                  className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ border: `1px solid ${selected?.id === photo.id ? "#00D4FF50" : "rgba(0,212,255,0.12)"}`, background: "#0C1322" }}
                >
                  <div className="relative" style={{ height: 140, background: "#0F1A2E" }}>
                    <img src={photo.thumb} alt="Evidence" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(7,11,20,0.85))" }} />
                    <div
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, background: `${triggerColors[photo.triggered]}22`, color: triggerColors[photo.triggered], border: `1px solid ${triggerColors[photo.triggered]}40` }}
                    >
                      {photo.triggered.toUpperCase()}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#94A3B8" }}>{photo.time}</div>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={9} style={{ color: "#64748B" }} />
                      <span style={{ fontSize: 10, color: "#94A3B8" }}>{photo.location}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{photo.device}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelected(photo)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: "#0C1322", border: `1px solid ${selected?.id === photo.id ? "#00D4FF40" : "rgba(0,212,255,0.1)"}` }}
                >
                  <img src={photo.thumb} alt="Evidence" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1" }}>{photo.type}</span>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, background: `${triggerColors[photo.triggered]}15`, color: triggerColors[photo.triggered], border: `1px solid ${triggerColors[photo.triggered]}30` }}
                      >
                        {photo.triggered}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>{photo.time} · {photo.device}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>{photo.size}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-72 flex flex-col shrink-0 overflow-y-auto" style={{ background: "#080E1A", borderLeft: "1px solid rgba(0,212,255,0.1)" }}>
          <div className="p-4" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Evidence Detail</span>
              <button onClick={() => setSelected(null)} style={{ fontSize: 18, color: "#64748B", lineHeight: 1 }}>×</button>
            </div>
            <img src={selected.url} alt="Evidence" className="w-full rounded-xl object-cover" style={{ height: 180 }} />
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Capture Info</div>
              {[
                { label: "Triggered by", value: selected.triggered, color: triggerColors[selected.triggered] },
                { label: "Camera", value: selected.type },
                { label: "Device", value: selected.device },
                { label: "File size", value: selected.size },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: color || "#CBD5E1" }}>{value}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Location</div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={11} style={{ color: "#00D4FF" }} />
                <span style={{ fontSize: 11, color: "#CBD5E1" }}>{selected.location}</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>{selected.coords}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={10} style={{ color: "#64748B" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>{selected.time}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF", fontSize: 12, fontWeight: 500 }}
              >
                <Download size={13} />
                Export
              </button>
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(255,51,85,0.1)", border: "1px solid rgba(255,51,85,0.25)", color: "#FF3355" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
