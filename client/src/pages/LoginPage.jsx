import React from "react";
import "../styles/style.css"; // nhớ import CSS

const LoginPage = () => {
  return (
    <div className="login-container">

      {/* Background */}
      <div className="background-blur"></div>

      <div className="login-box">
        <h2>Login</h2>
        <p className="subtitle">Sign in to save your history and favorites.</p>

        <form>

          <label>Email address</label>
          <input type="email" placeholder="you@example.com" />

          <label>Password</label>
          <input type="password" />

          <div className="checkbox-line">
            <input type="checkbox" />
            <span>Keep me signed in</span>
          </div>

          <div className="btn-row">
            <button className="btn-signin">Sign in</button>
            <button className="btn-create">Create account</button>
          </div>

          <div className="forgot">
            <a href="#">Forgot password?</a>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
