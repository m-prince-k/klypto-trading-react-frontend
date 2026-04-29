import { Navigate, useNavigate } from "react-router-dom";

// protected.js
export function getSession() {
  // console.log(localStorage.getItem("session"),'98765456')
  return localStorage.getItem("session") || sessionStorage.getItem("session");
}

export function isAuthenticated() {
  return !!getSession();
}

export function logout() {
    
  localStorage.removeItem("session");
  sessionStorage.removeItem("session");
}