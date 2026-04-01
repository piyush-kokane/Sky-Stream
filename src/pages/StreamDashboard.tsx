import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./styles/StreamDashboard.css";

type Stream = {
  streamId: string;
  title: string;
  rtmpUrl: string;
  streamKey: string;
  playbackUrl: string;
  viewerCount?: number;
};

function StreamDashboard() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const API_BASE = "https://2bjtydde2g.execute-api.us-east-1.amazonaws.com/prod";

  const [stream, setStream] = useState<Stream | null>(null);
  const [videoKey, setVideoKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [revealedKey, setRevealedKey] = useState(false);
  const isLiveRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStream = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-stream?streamId=${streamId}`);
      let data = await res.json();
      if (typeof data.body === "string") data = JSON.parse(data.body);
      setStream(data);
      if (data.viewerCount !== undefined) setViewerCount(data.viewerCount);

      const nowLive = !!data.playbackUrl;
      if (nowLive && !isLiveRef.current) {
        isLiveRef.current = true;
        setIsLive(true);
        startTimeRef.current = Date.now();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000));
        }, 1000);
      } else if (!nowLive && isLiveRef.current) {
        isLiveRef.current = false;
        setIsLive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsed(0);
        startTimeRef.current = null;
      }
    } catch (err) {
      console.error("Stream fetch error:", err);
    }
  };

  const refreshStream = async () => {
    setRefreshing(true);
    await fetchStream();
    setVideoKey((prev) => prev + 1);
    setRefreshing(false);
  };

  const deleteStream = async () => {
    if (!window.confirm("Are you sure you want to delete this stream?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Stream deleted successfully");
        navigate("/home");
      } else {
        toast.error("Failed to delete stream: " + (data.message || data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting stream");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied"))
      .catch((err) => console.error("Copy failed:", err));
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  useEffect(() => {
    const init = async () => {
      await fetchStream();
    };

    init();

    const interval = setInterval(fetchStream, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!stream)
    return (
      <div className="sd-loading">
        <span className="sd-loading-dot" />
        <span className="sd-loading-dot" />
        <span className="sd-loading-dot" />
      </div>
    );

  const rows = [
    { label: "Stream ID", value: stream.streamId, secret: false },
    { label: "RTMP URL", value: stream.rtmpUrl, secret: false },
    { label: "Stream Key", value: stream.streamKey, secret: true },
    { label: "Playback URL", value: stream.playbackUrl, secret: false },
  ];

  return (
    <div className="sd-root">
      {/* ── Header ── */}
      <header className="sd-header">
        <div className="sd-header-left">
          <h1 className="sd-title">{stream.title}</h1>
          <div className="sd-meta">
            <span className="sd-viewer-pill">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person</span>
              {viewerCount} watching
            </span>
          </div>
        </div>
        <div className={`sd-timer ${isLive ? "sd-timer--live" : ""}`}>
          <span className="sd-timer-label">DURATION</span>
          <span className="sd-timer-value">{formatTime(elapsed)}</span>
        </div>
      </header>

      {/* ── Video ── */}
      <div className="sd-video-wrap">
        {stream.playbackUrl ? (
          <video key={videoKey} src={stream.playbackUrl} controls autoPlay />
        ) : (
          <div className="sd-no-stream">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect x="1" y="7" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M25 13.5l9-5v15l-9-5v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <p>Waiting for signal</p>
            <span>Connect OBS to the RTMP URL below</span>
          </div>
        )}
        {isLive && <span className="sd-rec-chip">● LIVE</span>}
      </div>

      {/* ── Actions ── */}
      <div className="sd-actions">
        <button className="sd-btn sd-btn--ghost" onClick={refreshStream} disabled={refreshing}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
        <button className="sd-btn sd-btn--danger" onClick={deleteStream}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
          Delete Stream
        </button>
      </div>

      {/* ── Details ── */}
      <section className="sd-details">
        <div className="sd-section-label">Stream Details</div>
        {rows.map(({ label, value, secret }) => (
          <div className="sd-row" key={label}>
            <span className="sd-row-label">{label}</span>
            <span className="sd-row-value">
              <span className="sd-row-value">
              {secret && !revealedKey
                ? "• ".repeat(Math.min((value || "").length, 42))
                : value || "—"}
              </span>
            </span>
            <div className="sd-row-btns">
              {secret && (
                <button
                  className="sd-icon-btn"
                  onClick={() => setRevealedKey((p) => !p)}
                  title={revealedKey ? "Hide key" : "Reveal key"}
                >
                  {revealedKey ? (
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>visibility_off</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>visibility</span>
                  )}
                </button>
              )}
              <button
                className="sd-icon-btn"
                onClick={() => copyToClipboard(value || "")}
                title="Copy to clipboard"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>content_copy</span>
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default StreamDashboard;