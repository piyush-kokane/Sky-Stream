import "./styles/VideoPlayer.css";
import video from "@assets/node_assets/nvideo.mp4";

export default function VideoPlayer() {
  return (
    <div className="video-player">
      <video
        controls
        autoPlay
        poster="https://picsum.photos/1280/720"
      >
        <source src={video} />
      </video>

      <span className="material-symbols-outlined back">arrow_back</span>
    </div>
  );
}
