import { useState } from "react";
import axios from "axios";
import "./Login.css";

export default function Register() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("パスワードが一致しません。");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("http://localhost:3000/api/auth/register", {
                firstName,
                lastName,
                username,
                email,
                password
            });

            console.log("REGISTER OK:", res.data);

            setSuccess("アカウントが作成されました。ログインしてください。");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);

        } catch (err) {
            console.error(err);

            setError(err.response?.data?.message || "登録に失敗しました。");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-page">
            <div className="register-card">

                <div className="login-image-area">
                    <img src="/assets/register.jpg" alt="register" />
                </div>

                <form className="login-form" onSubmit={handleRegister}>
                    <h2 className="login-title">サインアップ</h2>
                    {error && <p className="login-error">{error}</p>}
                    {success && <p className="login-success">{success}</p>}

                    <div className="login-input-group">
                        <span className="login-icon">
                            {/* co the tach icon ra mot file stytle rieng sau nay de cho gon  */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="名前"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <span className="login-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="姓"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

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
                                <path d="M4 4h16v16H4z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </span>
                        <input
                            type="email"
                            placeholder="メール"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <div className="login-input-group">
                        <span className="login-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        <input
                            type="password"
                            placeholder="パスワードを確認する"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="login-button" type="submit" disabled={loading}>
                        {loading ? "作成中..." : "サインアップ"}
                    </button>

                    <p className="login-register-text">
                        すでにアカウントをお持ちですか？
                        <a href="/login" className="login-link"> ログイン</a>
                    </p>
                </form>

            </div>
        </div>
    );
}
