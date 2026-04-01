import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import type { ReactElement } from "react";
import { useState } from "react";

import Landing from "@/pages/Landing";
import Home from "@pages/Home";
import StreamDashboard from "@pages/StreamDashboard";
import Watch from "@pages/Watch";

import "./App.css";



function ProtectedRoute({ element }: { element: ReactElement }) {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    console.log("Please Login first")
    toast.error("Please Login first");
    return <Navigate to="/" replace />;
  }

  return element;
}

export default function App() {
  const [showGoLive, setShowGoLive] = useState(false);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />


      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute
              element={
                <Home
                  showGoLive={showGoLive}
                  setShowGoLive={setShowGoLive}
                />
              }
            />
          }
        />

        <Route
          path="/watch/:playbackUrl"
          element={
            <ProtectedRoute
              element={
                <Watch
                  showGoLive={showGoLive}
                  setShowGoLive={setShowGoLive}
                />
              }
            />
          }
        />
      
        <Route
          path="/stream/:streamId"
          element={<ProtectedRoute element={<StreamDashboard />} />}
        />
      </Routes>
    </>
  );
}
