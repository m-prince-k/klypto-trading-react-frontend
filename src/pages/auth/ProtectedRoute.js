import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./protected";

export function ProtectedRoute({ children }) {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setLoggedIn(isAuthenticated());
    };

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}