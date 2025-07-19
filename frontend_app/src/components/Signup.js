import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
      message: "",
      error: "",
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = this.state;

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (response.status === 201) {
          this.setState({ message: result.message, error: "" });
          this.props.history.push("/verify-notice");
      } 
      else {
        this.setState({ error: JSON.stringify(result), message: "" });
      }
    } catch (err) {
      this.setState({ error: "Something went wrong." });
    }
  };

  handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/accounts/google/login/";
  };

  render() {
    const { name, email, password, message, error } = this.state;

    return (
      <div className="d-flex align-items-center loginBox">
        <form onSubmit={this.handleSubmit} className="form-signin bg-white">
          <h3>Sign Up</h3>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <input
            type="text"
            className="form-control mt-4"
            value={name}
            onChange={(e) => this.setState({ name: e.target.value })}
            placeholder="name"
            required
          />
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => this.setState({ email: e.target.value })}
            placeholder="Email"
            required
          />
          <input
            type="password"
            className="form-control mb-2"
            value={password}
            onChange={(e) => this.setState({ password: e.target.value })}
            placeholder="Password"
            required
          />

          <button type="submit" className="btn btn-primary btn-block mb-3">
            Sign Up
          </button>

          <button
            type="button"
            onClick={this.handleGoogleLogin}
            className="btn btn-danger btn-block"
          >
            Sign up with Google
          </button>

          <p className="mt-3 text-center">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </form>
      </div>
    );
  }
}
