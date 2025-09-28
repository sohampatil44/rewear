// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import Browse from "./pages/Browse";
import AddItem from "./pages/AddItem";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import Navbar from "../src/pages/Navbar.js";
import Footer from "../src/pages/Footer";
import Swap from "./pages/Swap.js";
import FAQ from "./pages/FAQ.js";
import SwapRequest from "./pages/SwapRequest"; // new swap request page
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      {/* ✅ Navbar always visible */}
      <Navbar />

      {/* ✅ Main content */}
      <div style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/AuthPage" element={<AuthPage />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/swap-request/:itemId" element={<SwapRequest />} />
          {/* Protected Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* ✅ Footer always visible */}
      <Footer />

      {/* ✅ Toast container should be outside Routes */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;
