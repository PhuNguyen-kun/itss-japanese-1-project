import { useState } from "react";
import "./Login.css";

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const sampleUsers = [
        { username: "admin", password: "123456", token: "admin_token_123" },
        { username: "hieu", password: "123", token: "hieu_token_456" }
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        setTimeout(() => {
            const user = sampleUsers.find(
                (u) => u.username === username && u.password === password
            );

            if (!user) {
                setError("ユーザー名またはパスワードが間違っています。");
                setLoading(false);
                return;
            }
            localStorage.setItem("token", user.token);
            // Chuyển hướng, phake delay 
            window.location.href = "/";
        }, 700);
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <form className="login-form" onSubmit={handleLogin}>
                    <h2 className="login-title">ログイン</h2>

                    {error && <p className="login-error">{error}</p>}

                    <div className="login-input-group">
                        <span className="login-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="ユーザー名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <span className="login-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        <input
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "処理中..." : "ログイン"}
                    </button>

                    <p className="login-register-text">
                        アカウントをお持ちでありませんか？
                        <a href="/register" className="login-link"> 作成する</a>
                    </p>
                </form>

                <div className="login-image-area">
                    <img src="/assets/loginimg.jpg" alt="login" />
                </div>
            </div>
        </div>
    );
}
