import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import VideoCard from "@/components/VideoCard";
import GoLive from "@components/GoLive";
import "@/pages/styles/Watch.css";

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

type WatchProps = {
  showGoLive: boolean;
  setShowGoLive: React.Dispatch<React.SetStateAction<boolean>>;
};

const getRandomAvatar = (i: number) =>
  `https://randomuser.me/api/portraits/men/${i % 100}.jpg`;

export default function Watch({ showGoLive, setShowGoLive }: WatchProps) {
  const { playbackUrl: encodedUrl } = useParams<{ playbackUrl: string }>();
  const playbackUrl = decodeURIComponent(encodedUrl ?? "");
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://2bjtydde2g.execute-api.us-east-1.amazonaws.com/prod/live-streams"
      );
      let data: unknown = await res.json();

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
        avatarUrl: getRandomAvatar(i),
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

  // The stream matching the URL param
  const selectedStream = streams.find(s => s.playbackUrl === playbackUrl) ?? null;

  // Related = everyone except the current stream
  const relatedStreams = streams.filter((s) => s.playbackUrl !== playbackUrl);

  const handleRelatedClick = (stream: Stream) => {
    if (!stream.playbackUrl) {
      toast.error("This stream cannot be played right now.");
    }
    // VideoCard's onClick already calls navigate(), nothing extra needed
  };

  return (
    <div className="watch-page">
      <Navbar onGoLive={() => setShowGoLive(true)} />

      {showGoLive && <GoLive onClose={() => setShowGoLive(false)} />}

      <div className="watch-body">
        <div className="left-container">
          <VideoPlayer
            playbackUrl={selectedStream?.playbackUrl}
            poster={selectedStream?.thumbnailUrl}
          />

          <div className="video-details">
            <p className="title">
              {loading ? "Loading..." : selectedStream?.title ?? "Stream not found"}
            </p>

            <div className="top-row">
              <div className="channel-info">
                <div className="avatar">
                  <img
                    className="avatar"
                    src={selectedStream?.avatarUrl}
                    alt=""
                    onError={(e) => e.currentTarget.remove()}
                  />
                </div>
                <div className="channel-text">
                  <p className="channel-name">{selectedStream?.username}</p>
                  <p className="meta">{selectedStream?.category} • {selectedStream?.viewerCount.toLocaleString()} watching now</p>
                </div>
              </div>

              <div className="actions">
                <button className="icon-btn">
                  <span className="material-symbols-outlined">thumb_up</span>
                  24K
                </button>
                <button className="icon-btn">
                  <span className="material-symbols-outlined">thumb_down</span>
                </button>
                <button className="icon-btn">
                  <span className="material-symbols-outlined">share</span>
                  Share
                </button>
                <button className="icon-btn follow-btn">Follow</button>
              </div>
            </div>
          </div>
        </div>

        <div className="right-container">
          <div className="header">
            <h1>Related Streams</h1>
          </div>

          <div className="video-grid">
            {relatedStreams.map((s, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}