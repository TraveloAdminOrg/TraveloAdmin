// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";


interface ProtectedRouteProps {
  children: ReactNode; // <--- type defined here
}

export default function ProtectedRoute({ children } : ProtectedRouteProps) {
  const token = localStorage.getItem("token"); // check if user is "logged in"
  return token ? children : <Navigate to="/TailAdmin/signin" />; // redirect if not logged in
}
