import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "react-oidc-context";
import { UserProvider } from "@/hooks/useUser.tsx";
import App from "./App.tsx";
import "./index.css";


const redirectUri = window.location.hostname === "localhost"
  ? `${window.location.origin}/`
  : "https://skydrive.onkaarkale.workers.dev/";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_zrTYaJ2yz",
  client_id: "6hvkjdauc0gspl7mtlmt4ns0nt",
  redirect_uri: redirectUri,
  post_logout_redirect_uri: redirectUri,
  response_type: "code",
  scope: "email openid phone",
};


createRoot(document.getElementById("root")!).render(
  //<StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <BrowserRouter>
        <UserProvider>
          <App />
        </UserProvider>
      </BrowserRouter>
    </AuthProvider>
  //</StrictMode>
);
