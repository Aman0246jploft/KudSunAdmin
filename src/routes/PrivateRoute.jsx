import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import EditThread from "../Pages/Thread/EditThread";

export default function PrivateRoute() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" />;
}

const routes = [
  // ... other routes ...
  {
    path: "/thread/edit/:id",
    element: <EditThread />,
  },
  // ... other routes ...
];
