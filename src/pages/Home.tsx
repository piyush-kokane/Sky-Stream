import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import Hls from "hls.js";
import "@pages/styles/Home.css";

import GoLive from "@components/GoLive";
import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VideoCard";


interface Stream {
  streamId: string;
  title: string;
  username: string;
  category: string;
  thumbnailUrl: string;
  playbackUrl: string;
  viewerCount: number;
  isLive: boolean;
  avatarUrl: string;
}

type HomeProps = {
  showGoLive: boolean;
  setShowGoLive: React.Dispatch<React.SetStateAction<boolean>>;
};

function Home({ showGoLive, setShowGoLive }: HomeProps) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);

  // Helper for random avatar
  const getRandomAvatar = (i: number) =>
    `https://randomuser.me/api/portraits/men/${i % 100}.jpg`;

  // -----------------------------
  // Fetch live streams
  // -----------------------------
  const fetchStreams = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://2bjtydde2g.execute-api.us-east-1.amazonaws.com/prod/live-streams"
      );

      let data: unknown = await res.json();

      // Parse API Gateway response safely
      if (
        typeof data === "object" &&
        data !== null &&
        "body" in data &&
        typeof (data as any).body === "string"
      ) {
        data = JSON.parse((data as { body: string }).body);
      }

      if (!Array.isArray(data)) data = [];

      const mappedStreams: Stream[] = (data as any[]).map((s, i) => ({
        streamId: s.playbackUrl || String(i),
        title: s.title || "Untitled Stream",
        username: s.username || s.userId || "Anonymous",
        category: s.category || "General",
        thumbnailUrl: s.thumbnailUrl || "/placeholder.jpg",
        playbackUrl: s.playbackUrl || "",
        viewerCount: s.viewerCount ?? 0,
        isLive: true,
        avatarUrl: getRandomAvatar(i), // RANDOM AVATAR
      }));

      setStreams(mappedStreams);
    } catch (err) {
      console.error("Failed to fetch streams:", err);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 5000);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // Open stream
  // -----------------------------
  const openStream = (stream: Stream) => {
    if (!stream.playbackUrl) {
      toast.error("This stream cannot be played right now.");
      return;
    }
    setSelectedStream(stream);
  };

  // -----------------------------
  // HLS Playback
  // -----------------------------
  useEffect(() => {
    if (selectedStream?.playbackUrl && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(selectedStream.playbackUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error("HLS.js error:", data);
        });

        return () => {
          hls.destroy();
        };
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = selectedStream.playbackUrl;
      }
    }
  }, [selectedStream]);

  return (
    <div className="home-page">
      <Navbar onGoLive={() => setShowGoLive(true)} />

      {showGoLive && <GoLive onClose={() => setShowGoLive(false)} />}

      <div className="home-body">
        <div className="videos">
          <div className="header">
            <span />
            <h1>Live Now</h1>
          </div>

          {!loading && streams.length === 0 && (
            <p>No streams currently live</p>
          )}

          {/* Stream Cards */}
          {!selectedStream && (
            <div className="video-grid">
              {streams.map((s, i) => (
                <div key={i} onClick={() => openStream(s)}>
                  <VideoCard
                    key={s.streamId || i}
                    playbackUrl={s.playbackUrl}
                    thumbnail={s.thumbnailUrl}
                    title={s.title}
                    channelName={s.username}
                    category={s.category}
                    watching={s.viewerCount}
                    isLive={s.isLive}
                    avatar={s.avatarUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;