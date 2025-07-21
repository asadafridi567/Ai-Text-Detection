import React from 'react';
import { Route, Redirect } from 'react-router-dom'; // For v5
import { useAuth } from '../hooks/useAuth'; // Import your custom hook

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <h3>Loading...</h3>
          <p>Checking authentication status.</p>
        </div>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/signin" /> // Redirect to login if not authenticated
        )
      }
    />
  );
};

export default ProtectedRoute;