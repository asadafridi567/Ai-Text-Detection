// frontend_app/src/components/Welcome.js
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "../index.css";
import { useAuth } from "../hooks/useAuth";

export default function Welcome() {
  // Use the loading state from useAuth
  const { isAuthenticated, user, logout, checkAuthStatus, loading } = useAuth();
  const history = useHistory();

  // Effect to check authentication status when component mounts
  useEffect(() => {
    // Only run this if we are not currently loading AND not authenticated
    if (!loading && !isAuthenticated) {
      history.push("/signin"); // Redirect if not authenticated by either method
    }
    // No need to call checkAuthStatus here explicitly, as useAuth calls it on its own mount
    // and provides the `loading` state for initial render handling.
  }, [isAuthenticated, loading, history]); // Dependencies for useEffect

  // --- Crucial: Conditional rendering based on loading and authentication status ---
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <h3>Loading authentication status...</h3>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // If not loading, but also not authenticated, we should have already redirected.
  // This block should ideally not be reached if the redirect logic works correctly.
  if (!isAuthenticated) {
    return null; // Or show a simple message like "Access Denied" if redirect isn't immediate
  }

  // If loading is false AND isAuthenticated is true, then we can safely render
  // and access user properties.
  return (
    <div>
      {/* Navbar section */}
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">
            BS5
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarsExampleDefault"
            aria-controls="navbarsExampleDefault"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav me-md-auto">
              <li className="nav-item active">
                <a className="nav-link" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Link
                </a>
              </li>
            </ul>
            <span className="navbar-text">
              <Link className="nav-link" onClick={logout} to="#">
                Logout
              </Link>
            </span>
          </div>
        </div>
      </nav>

      {/* Main content section */}
      <main role="main">
        <div className="jumbotron">
          <div className="container">
            {/* Safely access user.username because we've checked for isAuthenticated */}
            <h1 className="display-3">Hello, {user?.username || "User"}!</h1>{" "}
            <p>
              This is a template for a simple marketing or informational
              website. It includes a large callout called a jumbotron and
              three supporting pieces of content. Use it as a starting point
              to create something more unique.
            </p>
            <p>
              <a className="btn btn-primary btn-lg" href="#" role="button">
                Learn more &raquo;
              </a>
            </p>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h2>Heading</h2>
              <p>
                Donec id elit non mi porta gravida at eget metus. Fusce
                dapibus, tellus ac cursus commodo, tortor mauris condimentum
                nibh, ut fermentum massa justo sit amet risus.
              </p>
              <p>
                <a className="btn btn-secondary" href="#" role="button">
                  View details &raquo;
                </a>
              </p>
            </div>
            <div className="col-md-4">
              <h2>Heading</h2>
              <p>
                Donec id elit non mi porta gravida at eget metus. Fusce
                dapibus, tellus ac cursus commodo, tortor mauris condimentum
                nibh, ut fermentum massa justo sit amet risus.
              </p>
              <p>
                <a className="btn btn-secondary" href="#" role="button">
                  View details &raquo;
                </a>
              </p>
            </div>
            <div className="col-md-4">
              <h2>Heading</h2>
              <p>
                Donec sed odio dui. Cras justo odio, dapibus ac facilisis in,
                egestas eget quam. Vestibulum id ligula porta felis euismod
                semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris
                condimentum nibh.
              </p>
              <p>
                <a className="btn btn-secondary" href="#" role="button">
                  View details &raquo;
                </a>
              </p>
            </div>
          </div>
          <hr />
        </div>
      </main>

      {/* Footer section */}
      <footer className="container">
        <p>&copy; Company 2017-2019</p>
      </footer>
    </div>
  );
}