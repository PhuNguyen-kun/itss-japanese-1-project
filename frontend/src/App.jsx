import "./App.css";
import Home from "./pages/user/Home";
import Story from "./pages/user/Story";
import Topics from "./pages/user/Topics";
import Documents from "./pages/user/Documents";
import Notifications from "./pages/user/Notifications";
import Profile from "./pages/user/Profile";
import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import AdminTopics from "./pages/admin/Topics";
import AdminLogin from "./pages/admin/AdminLogin";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/login/register";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <Story />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <Topics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <Members />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/topics"
          element={
            <AdminRoute>
              <AdminTopics />
            </AdminRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
