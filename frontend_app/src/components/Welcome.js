import React, { Component } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "../index.css";

export default class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      this.props.history.push("/signin");
      return;
    }

    const getUserDetails = JSON.parse(sessionStorage.getItem("userDetails"));

    if (getUserDetails && getUserDetails.username) {
      this.setState({ username: getUserDetails.username });
    } else {
      this.setState({ username: "User" });
    }
  }

  logOut = async (e) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    try {
      await fetch("http://localhost:8000/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Clear all stored tokens and session data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("userDetails");

    this.props.history.push("/signin");
  };

  render() {
    return (
      <div>
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
                <Link className="nav-link" onClick={this.logOut}>
                  Logout
                </Link>
              </span>
            </div>
          </div>
        </nav>

        <main role="main">
          <div className="jumbotron">
            <div className="container">
              <h1 className="display-3">Hello, {this.state.username}!</h1>
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

        <footer className="container">
          <p>&copy; Company 2017-2019</p>
        </footer>
      </div>
    );
  }
}