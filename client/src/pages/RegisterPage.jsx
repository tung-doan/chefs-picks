import React from "react";
import { Link } from "react-router-dom";
import "../styles/style.css";

const RegisterPage = () => {
  return (
    <div className="login-container">
      <div className="background-blur"></div>

      <div className="login-box">
        <h2>Sign Up</h2>
        <p className="subtitle">Sign up to save your history and favorites.</p>

        <form>
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" required />

          <label>Password</label>
          <input type="password" required />

          <label>Confirm Password</label>
          <input type="password" required />

          <div className="btn-row">
            <button type="submit" className="btn-signup">Sign up</button>
            <Link to="/login" className="btn-create">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
