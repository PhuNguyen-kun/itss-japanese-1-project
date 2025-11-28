import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { MESSAGES } from "../../constants/messages";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordHint, setPasswordHint] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    if (pwd.length === 0) {
      setPasswordStrength("");
      setPasswordHint("");
      return;
    }

    if (pwd.length < 8) {
      setPasswordStrength("weak");
      setPasswordHint(MESSAGES.PASSWORD_STRENGTH.WEAK_LENGTH);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

    const typeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSymbol].filter(
      Boolean
    ).length;

    if (typeCount < 2) {
      setPasswordStrength("weak");
      setPasswordHint(MESSAGES.PASSWORD_STRENGTH.WEAK_COMPLEXITY);
    } else if (typeCount === 2) {
      setPasswordStrength("medium");
      setPasswordHint(MESSAGES.PASSWORD_STRENGTH.MEDIUM);
    } else {
      setPasswordStrength("strong");
      setPasswordHint(MESSAGES.PASSWORD_STRENGTH.STRONG);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("パスワードは少なくとも8文字必要です。");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const typeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSymbol].filter(
      Boolean
    ).length;

    if (typeCount < 2) {
      setError(
        "パスワードは大文字、小文字、数字、記号のうち2種類以上を含む必要があります。"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    setLoading(true);

    const result = await register({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    if (result.success) {
      setSuccess("アカウントが作成されました。ログインしてください。");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(result.message || "登録に失敗しました。");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="register-card">
        <div className="login-image-area">
          <img src="/assets/register.jpg" alt="register" />
        </div>

        <form className="login-form register-form" onSubmit={handleRegister}>
          <h2 className="login-title">{MESSAGES.UI.REGISTER}</h2>
          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}

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
              placeholder={MESSAGES.UI.FIRSTNAME_PLACEHOLDER}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input
              type="text"
              placeholder={MESSAGES.UI.LASTNAME_PLACEHOLDER}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
                <path d="M4 4h16v16H4z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input
              type="email"
              placeholder={MESSAGES.UI.EMAIL_PLACEHOLDER}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => {
                setPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
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

          {passwordHint && (
            <div
              className="password-hint"
              style={{
                fontSize: "12px",
                marginTop: "-8px",
                marginBottom: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor:
                  passwordStrength === "weak"
                    ? "#fff3cd"
                    : passwordStrength === "medium"
                    ? "#cfe2ff"
                    : "#d1e7dd",
                color:
                  passwordStrength === "weak"
                    ? "#856404"
                    : passwordStrength === "medium"
                    ? "#084298"
                    : "#0a3622",
                border: `1px solid ${
                  passwordStrength === "weak"
                    ? "#ffeaa7"
                    : passwordStrength === "medium"
                    ? "#b6d4fe"
                    : "#badbcc"
                }`,
              }}
            >
              {passwordHint}
            </div>
          )}

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
              type={showConfirmPassword ? "text" : "password"}
              placeholder={MESSAGES.UI.CONFIRM_PASSWORD_PLACEHOLDER}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={
                showConfirmPassword
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
                {showConfirmPassword ? (
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

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? MESSAGES.UI.CREATING : MESSAGES.UI.REGISTER}
          </button>

          <p className="login-register-text">
            {MESSAGES.UI.HAVE_ACCOUNT}
            <a href="/login" className="login-link">
              {" "}
              {MESSAGES.UI.LOGIN}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
