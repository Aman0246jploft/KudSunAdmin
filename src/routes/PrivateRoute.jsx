import React from "react";
import { Navigate, Outlet, Routes, Route } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import EditThread from "../Pages/Thread/EditThread";
import DisputeManagement from '../Pages/Dispute/DisputeManagement';

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
  {
    path: "/disputes",
    element: <DisputeManagement />,
  },
  // ... other routes ...
];
