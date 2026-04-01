import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Hls from "hls.js";
import "./styles/VideoPlayer.css";

type VideoPlayerProps = {
  playbackUrl?: string;
  poster?: string;
};

export default function VideoPlayer({ playbackUrl, poster }: VideoPlayerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (_, data) => console.error("HLS error:", data));
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = playbackUrl;
    }
  }, [playbackUrl]);

  return (
    <div className="video-player">
      <video ref={videoRef} controls autoPlay poster={poster} />
      <span
        className="material-symbols-outlined back"
        onClick={() => navigate("/")}
      >
        arrow_back
      </span>
    </div>
  );
}