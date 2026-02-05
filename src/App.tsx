import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import type { ReactElement } from "react";

import Home from "@pages/Home";
//import Stream from "@pages/Stream";
import Watch from "@pages/Watch";

import "./App.css";



function ProtectedRoute({ element }: { element: ReactElement }) {
  const { isAuthenticated } = useUser();
  return element;

  if (!isAuthenticated) {
    console.log("Please Login first")
    toast.error("Please Login first");
    return <Navigate to="/" replace />;
  }

  return element;
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/*" element={<ProtectedRoute element={<Watch />} />} />
      </Routes>
    </>
  );
}
