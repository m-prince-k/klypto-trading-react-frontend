export function getSession() {
  return (
    localStorage.getItem("session") ||
    sessionStorage.getItem("session")
  );
}

export function isAuthenticated() {
  return !!getSession();
}

export function logout() {
  localStorage.removeItem("session");
  sessionStorage.removeItem("session");
}