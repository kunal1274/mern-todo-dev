// src/App.jsx
import React from "react";
import { Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import TestManagement from "./pages/TestManagement";
import TestMap from "./TestMapMultipleMarkers";
import MapWithDraggablePinAndDirections from "./TestMapDirections";
import TestV2 from "./pages/TestManagementV2";
import MapWithBackend from "./TestMapWithBackend";
import MapWithBackendSimulation from "./TestMapWithBackendSimulation";
import MapWithBackendSimulationFan from "./TestMapSimulatedWithFan";
import TaskItem from "./pages/TaskManagement/TaskItem";
import TagManagement from "./pages/TaskManagement/TagManagement";
import UsersPage from "./pages/SalesModule/UsersPage";
import UserGroupsPage from "./pages/SalesModule/UserGroupsPage";
import ViewUserGroup from "./pages/SalesModule/ViewUserGroupsPage";
import EditUserGroup from "./pages/SalesModule/EditUserGroupsPage";
import HomePage from "./pages/Landing/HomePage";
import Layout from "./components/landing/Layout";
import Login from "./pages/Authentication/Login";
import { useAuthDetailed } from "./context/AuthContextDetailed";
import GoogleAuthCallback from "./pages/Authentication/GoogleAuthCallback";
import VerifyOtp from "./pages/Authentication/VerifyOtp";

function App1() {
  return (
    <>
      {/* Header / Nav */}
      <header className="bg-blue-900 p-4">
        <nav className="container mx-auto flex items-center space-x-4">
          <Link to="/" className="text-white font-semibold hover:text-blue-200">
            Home
          </Link>
          <Link
            to="/users"
            className="text-white font-semibold hover:text-blue-200"
          >
            Users
          </Link>
          <Link
            to="/user-groups"
            className="text-white font-semibold hover:text-blue-200"
          >
            User Groups
          </Link>
        </nav>
      </header>
      {/* Main Container */}
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/user-groups" element={<UserGroupsPage />} />
          <Route path="/user-groups/:groupId" element={<ViewUserGroup />} />
          <Route
            path="/user-groups/:groupId/edit"
            element={<EditUserGroup />}
          />
          <Route path="/gmap/backends" element={<MapWithBackend />} />
          <Route
            path="/gmap/backend-simulation"
            element={<MapWithBackendSimulation />}
          />
          <Route
            path="/gmap/backend-simulation-fan"
            element={<MapWithBackendSimulationFan />}
          />
          <Route
            path="/gmap/directions"
            element={<MapWithDraggablePinAndDirections />}
          />

          <Route path="/gmap/multi-markers" element={<TestMap />} />
          <Route path="/tag-management" element={<TagManagement />} />
          <Route path="/test-management" element={<TestManagement />} />
          <Route path="/test-v2" element={<TestV2 />} />

          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="*" element={<div>Route Not Found in Frontend</div>} />
        </Routes>
      </main>
    </>
  );
}

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthDetailed();
  console.log("line 1204 : is Authenticated", isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

function App() {
  const { loading, elapsedSeconds } = useAuthDetailed();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700 mb-2">
          Reauthenticating...
        </p>
        <p className="text-sm text-gray-500">
          Elapsed time: {elapsedSeconds ? elapsedSeconds.toFixed(2) : "0.00"}s
        </p>
      </div>
    );
  }
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      {/**Protected Routes */}
      {/* Protected Layout Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/user-groups" element={<UserGroupsPage />} />
          <Route path="/user-groups/:groupId" element={<ViewUserGroup />} />
          <Route
            path="/user-groups/:groupId/edit"
            element={<EditUserGroup />}
          />
          <Route path="/tag-management" element={<TagManagement />} />
          <Route path="/test-management" element={<TestManagement />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<div>Route Not Found in Frontend</div>} />

      {/* etc. */}
    </Routes>
  );
}
export default App;
