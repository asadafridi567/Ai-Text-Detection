import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = this.state;

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("access_token", result.access);
        localStorage.setItem("refresh_token", result.refresh);
        this.props.history.push("/welcome");
      } else {
        this.setState({ error: result.error || "Invalid credentials" });
      }
    } catch (err) {
      this.setState({ error: "Something went wrong." });
    }
  };

  handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/accounts/google/login/";
  };

  render() {
    const { email, password, error } = this.state;

    return (
      <div className="d-flex align-items-center loginBox">
        <form onSubmit={this.handleSubmit} className="form-signin bg-white">
          <h3>Login</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <input
            type="email"
            className="form-control mt-3"
            value={email}
            onChange={(e) => this.setState({ email: e.target.value })}
            placeholder="Email"
            required
          />
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => this.setState({ password: e.target.value })}
            placeholder="Password"
            required
          />

          <button type="submit" className="btn btn-primary btn-block mb-3">
            Login
          </button>

          <button
            type="button"
            onClick={this.handleGoogleLogin}
            className="btn btn-danger btn-block"
          >
            Login with Google
          </button>

          <p className="mt-3 text-center">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    );
  }
}
