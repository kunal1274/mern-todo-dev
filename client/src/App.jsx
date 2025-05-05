// src/App.jsx
import React, { useState } from "react";
import {
  Routes,
  Route,
  Link,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import CompaniesList from "./pages/companies/CompaniesList";
import CompanyForm from "./pages/companies/CompanyForm";
import CompanyDetails from "./pages/companies/CompanyDetails";
import AuditLogsList from "./pages/AuditLogs/AuditLogsList";
import AuditLogDetails from "./pages/AuditLogs/AuditLogDetails";
import AuditLogEdit from "./pages/AuditLogs/AuditLogEdit";
import AuditLoggingConfig from "./pages/AuditLogs/AuditLoggingConfig";
import RBACConfig from "./pages/Authorization/RBACConfig";
import Customers from "./pages/phenomenon-dashboard/Customers";
import CustomerForm from "./pages/phenomenon-dashboard/CustomerForm";
import CustomerDetails from "./pages/phenomenon-dashboard/CustomerDetails";
import LayoutPhenomenon from "./components/phenomenon-dashboard/Layout";
import CustomerCreation from "./pages/shyam-db/CustomerCreation";
import SidebarShyam from "./components/shyam-db/Sidebar";
import HeaderShyam from "./components/shyam-db/Header";
import DashboardCrystal from "./pages/shyam-db/DashboardCrystal";
import TopbarCrystal from "./components/shyam-db/Topbar";
import SidebarCrystal from "./components/shyam-db/Sidebar";
import SalesOrderListCrystal from "./pages/shyam-db/SalesOrderList";
import SalesOrderDetails from "./pages/shyam-db/SalesOrderDetails";
import InventoryLanding from "./components/shyam-db/inventory/InventoryLanding";
import TabBar from "./components/shyam-db/layout/TabBar";
import SiteList from "./pages/shyam-db/inventory/SiteList";

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

const OTPProtectedRoute = ({ children }) => {
  const location = useLocation();
  // CHANGED: Instead of sessionStorage, we check the navigation state.
  const { state } = location;

  // If the state isn't set or otpSent is not true, redirect to /send-otp.
  if (!state || !state.otpSent) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthDetailed();
  console.log("line 1204 : is Authenticated", isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

function AppRenderDashboard() {
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
      <Route
        path="/verify-otp"
        element={
          <OTPProtectedRoute>
            <VerifyOtp />
          </OTPProtectedRoute>
        }
      />
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
          {/**Company Module  */}
          <Route path="/companies" element={<CompaniesList />} />
          <Route
            path="/companies/create"
            element={<CompanyForm isEdit={false} />}
          />
          <Route
            path="/companies/:id/edit"
            element={<CompanyForm isEdit={true} />}
          />
          <Route path="/companies/:id" element={<CompanyDetails />} />

          {/**Audit Logs */}
          {/* Example route for listing audit logs */}
          <Route path="/audit-logs" element={<AuditLogsList />} />

          {/* View single audit log details */}
          <Route path="/audit-logs/:id" element={<AuditLogDetails />} />

          {/* Edit single audit log */}
          <Route path="/audit-logs/:id/edit" element={<AuditLogEdit />} />
          <Route path="/audit-config" element={<AuditLoggingConfig />} />

          {/**Role based access controls */}
          <Route path="/rbac-config" element={<RBACConfig />} />

          {/* Add other routes as needed */}
          {/* <Route path="/" element={<Home />} /> */}
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<div>Route Not Found in Frontend</div>} />

      {/* etc. */}
    </Routes>
  );
}

// App Phenomenon Dashboard
function AppPhenomenonDashboard() {
  return (
    <LayoutPhenomenon>
      <Routes>
        <Route path="/" element={<Customers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/customers/:id/edit" element={<CustomerForm editMode />} />
      </Routes>
    </LayoutPhenomenon>
  );
}

// crystal dashb
function AppCrystalDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-zinc-50 text-gray-700">
      {/* sidebar */}
      <SidebarCrystal isOpen={sidebarOpen} />

      {/* right side */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopbarCrystal toggleSidebar={() => setSidebarOpen((s) => !s)} />
        <TabBar />
        <main className="flex-1 overflow-y-auto px-6 pb-10">
          <Routes>
            <Route path="/" element={<DashboardCrystal />} />
            <Route path="/sales-orders" element={<SalesOrderListCrystal />} />
            <Route path="/sales-orders/:id" element={<SalesOrderDetails />} />
            <Route path="/inventory" element={<InventoryLanding />} />
            <Route path="/sites" element={<SiteList />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default AppCrystalDashboard;
