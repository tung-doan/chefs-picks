import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import "../styles/style.css";
import { API_BASE_URL } from "../config/api-config";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kiểm tra nếu đã đăng nhập thì redirect về homepage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (!email.includes("@")) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "ログインに失敗しました");
        setIsLoading(false);
        return;
      }

      if (data.success && data.data) {
        // Lưu token và user info vào localStorage
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        // Lưu userId (luôn là một chuỗi ID thuần) để các trang khác có thể kiểm tra
        const extractId = (u) => {
          if (!u) return null;
          if (typeof u === 'string') return u;
          if (typeof u === 'object') return u._id || u.id || null;
          return null;
        };
        const uid = extractId(data.data.user);
        if (uid) localStorage.setItem("userId", String(uid));
        console.log("Logged in user:", data.data.user);

        // Redirect về trang chuyển hướng nếu có ?redirect=..., ngược lại về homepage
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect') || '/';
        navigate(redirectTo);
      } else {
        setError("予期しないエラーが発生しました");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background */}
      <div className="background-blur"></div>

      <div className="login-box">
        <h2>ログイン</h2>
        <p className="subtitle">アカウントにサインインして、履歴とお気に入りを保存しましょう。</p>

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <div className="checkbox-line">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="remember" style={{ cursor: "pointer" }}>
              ログイン状態を保持
            </label>
          </div>

          <div className="btn-row">
            <button
              type="submit"
              className="btn-signin"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>ログイン中...</span>
                </>
              ) : (
                "ログイン"
              )}
            </button>
            <Link
              to="/register"
              className="btn-create"
              style={{ pointerEvents: isLoading ? "none" : "auto" }}
            >
              アカウント作成
            </Link>
          </div>

          <div className="forgot">
            <Link to="/forgot-password">パスワードをお忘れですか？</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
