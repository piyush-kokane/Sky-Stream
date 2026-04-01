import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { toast } from "react-hot-toast";
import "./styles/GoLive.css";

function GoLive({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const auth = useAuth();

  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility] = useState("public");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://2bjtydde2g.execute-api.us-east-1.amazonaws.com/prod";

  const getUsername = () => {
    try {
      const key = Object.keys(sessionStorage).find((k) =>
        k.startsWith("oidc.user")
      );
      if (!key) return "";

      const session = JSON.parse(sessionStorage.getItem(key) || "{}");
      const payload = JSON.parse(atob(session.id_token.split(".")[1]));

      return (
        payload["preferred_username"] ||
        payload["cognito:username"] ||
        payload.email ||
        ""
      );
    } catch {
      return "";
    }
  };

  useEffect(() => {
    setUsername(getUsername());
  }, []);

  const pollStream = (streamId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/get-stream?streamId=${streamId}`);
        let data = await res.json();
        if (typeof data.body === "string") data = JSON.parse(data.body);

        if (data?.rtmpUrl) {
          clearInterval(interval);
          navigate(`/stream/${streamId}`);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const createStream = async () => {
    if (!title.trim() || !category.trim()) {
      toast.error("Title and category required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/create-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          visibility,
          userId: username || "demo-user",
        }),
      });

      let data = await res.json();
      if (typeof data.body === "string") data = JSON.parse(data.body);

      if (!data.streamId) {
        toast.error("Stream creation failed");
        return;
      }

      pollStream(data.streamId);
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="golive-overlay" onClick={onClose}>
      <div
        className="golive-panel"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="panel-header">
          <h2>Go Live</h2>
          <span className="username">{username}</span>
        </div>

        <div className="panel-body">
          <input
            placeholder="Stream title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          {/* ✅ Horizontal buttons */}
          <div className="btn-group">
            <button onClick={() => (createStream(), onClose())} disabled={loading}>
              {loading ? "Creating..." : "Go Live"}
            </button>

            <button className="back-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoLive;