import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { MESSAGES } from "../../constants/messages";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      message.success(MESSAGES.AUTH.LOGIN_SUCCESS);
      navigate("/");
    } else {
      // Use message from backend response, fallback to default Japanese message
      setError(result.message || MESSAGES.AUTH.LOGIN_FAILED);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">{MESSAGES.UI.LOGIN}</h2>

          {error && <p className="login-error">{error}</p>}

          <div className="login-input-group">
            <span className="login-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input
              type="text"
              placeholder={MESSAGES.UI.USERNAME_PLACEHOLDER}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <span className="login-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={MESSAGES.UI.PASSWORD_PLACEHOLDER}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={
                showPassword
                  ? MESSAGES.UI.HIDE_PASSWORD
                  : MESSAGES.UI.SHOW_PASSWORD
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </>
                )}
              </svg>
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? MESSAGES.UI.LOADING : MESSAGES.UI.LOGIN}
          </button>

          <p className="login-register-text">
            {MESSAGES.UI.NO_ACCOUNT}
            <a href="/register" className="login-link">
              {" "}
              {MESSAGES.UI.CREATE_ACCOUNT}
            </a>
          </p>
        </form>

        <div className="login-image-area">
          <img src="/assets/loginimg.jpg" alt="login" />
        </div>
      </div>
    </div>
  );
}
