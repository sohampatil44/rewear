import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Badge } from "@mui/material";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0); // ✅ Pending items
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Fetch pending items if admin
  const fetchPendingCount = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isAdmin) {
          const res = await axios.get("http://localhost:5000/api/admin/pending-count", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPendingCount(res.data.count);
        }
      } catch (err) {
        setPendingCount(0);
      }
    }
  };

  // ✅ Check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsLoggedIn(true);
        setUser(parsedUser);

        if (parsedUser.isAdmin) {
          fetchPendingCount();
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location]);

  // Auto-refresh pending count every 30s if admin
  useEffect(() => {
    if (user?.isAdmin) {
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Check auth on focus
  useEffect(() => {
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate("/login"); // redirect to login
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/" onClick={handleNavLinkClick}>
            ReWear
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
          <Link to="/" onClick={handleNavLinkClick}>
            Home
          </Link>
          <Link to="/browse" onClick={handleNavLinkClick}>
            Browse
          </Link>

          {isLoggedIn && (
            <>
              <Link to="/add" onClick={handleNavLinkClick}>
                Add Item
              </Link>
  

              {/* ✅ Admin link with badge */}
              {user?.isAdmin && (
                <Link to="/admin" onClick={handleNavLinkClick}>
                  <Badge badgeContent={pendingCount} color="error">
                    Admin
                  </Badge>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="welcome-text">
                Welcome, {user?.name || user?.email || "User"}!
              </span>
              <div className="dropdown">
                <button className="user-btn">
                  <span>Account</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-content">
                  <Link to="/profile" onClick={handleNavLinkClick}>
                    Profile
                  </Link>
            
                  {/* ✅ Admin dropdown link with badge */}
                  {user?.isAdmin && (
                    <Link to="/admin" onClick={handleNavLinkClick}>
                      <Badge badgeContent={pendingCount} color="error">
                        Admin Dashboard
                      </Badge>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/Login">
                <button className="cta-btn secondary">Login</button>
              </Link>
              <Link to="/register">
                <button className="cta-btn primary">Register</button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <Link to="/" onClick={handleNavLinkClick}>
              Home
            </Link>
            <Link to="/browse" onClick={handleNavLinkClick}>
              Browse
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/add" onClick={handleNavLinkClick}>
                  Add Item
                </Link>
                <Link to="/dashboard" onClick={handleNavLinkClick}>
                  Dashboard
                </Link>
                <Link to="/profile" onClick={handleNavLinkClick}>
                  Profile
                </Link>

                {/* ✅ Mobile Admin link with badge */}
                {user?.isAdmin && (
                  <Link to="/admin" onClick={handleNavLinkClick}>
                    <Badge badgeContent={pendingCount} color="error">
                      Admin
                    </Badge>
                  </Link>
                )}

                <button onClick={handleLogout} className="logout-btn mobile">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/Login" onClick={handleNavLinkClick}>
                  Login
                </Link>
                <Link to="/register" onClick={handleNavLinkClick}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
