import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./protected";

export function ProtectedRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setLoggedIn(auth);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    // while checking auth, render nothing or a loader
    return <div>Loading...</div>;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}