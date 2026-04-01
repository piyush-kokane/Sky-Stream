import icon from "@assets/SkyStream-logo.png";
import { useAuth } from "react-oidc-context";
import "./styles/Navbar.css";

type NavbarProps = {
  onGoLive: () => void;
};

export default function Navbar({ onGoLive }: NavbarProps) {
  const auth = useAuth();

  const handleLogout = () => {
    auth.removeUser();
    auth.signoutRedirect();
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <img src={icon} alt="logo" className="logo" />
        <h1>Sky</h1>
        <h2>Stream</h2>
      </div>

      <div className="nav-center">
        {/*
        <div className="search-bar">
          <input placeholder="Search" />
          <span className="material-symbols-outlined">search</span>
        </div>
        */}
      </div>

      <div className="nav-right">
        <button onClick={onGoLive}>
          <span className="material-symbols-outlined">videocam</span>
          Go live
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
        {/*
          <span className="notifications material-symbols-outlined">notifications</span>
        */}
        <div className="avatar">
          <img
            className="avatar"
            src="https://randomuser.me/api/portraits/men/0.jpg"
            alt=""
            onError={(e) => {
              e.currentTarget.remove();
            }}
          />
        </div>
      </div>
    </div>
  );
}
