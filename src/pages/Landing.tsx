import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@assets/SkyStream-logo.png";
import "./styles/Landing.css";

export default function Landing() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate("/home");
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-overlay" />
      </div>

      <div className="landing-card">
        <div className="brand">
          <img src={logo} alt="SkyStream" className="brand-logo" />
          <span className="brand-name">
            <h1>Sky</h1>
            <h2>Stream</h2>
          </span>
        </div>

        <p className="brand-tagline">Live streaming, elevated.</p>

        <button className="signin-btn" onClick={() => auth.signinRedirect()}>
          <span className="signin-btn-text">Sign In to Continue</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <p className="landing-footer">
          By signing in you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}