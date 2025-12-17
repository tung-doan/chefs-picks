import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff, Key } from "lucide-react";
import "../styles/style.css";
import { API_BASE_URL } from "../config/api-config";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Lấy email từ localStorage nếu có
  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!email || !code || !newPassword || !confirmPassword) {
      setError("すべてのフィールドを入力してください");
      return;
    }

    if (!email.includes("@")) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    if (newPassword.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "パスワードのリセットに失敗しました");
        setIsLoading(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        // Xóa email khỏi localStorage
        localStorage.removeItem("resetEmail");
        // Redirect về login sau 2 giây
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("予期しないエラーが発生しました");
      }
    } catch (err) {
      console.error("Reset password error:", err);
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
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2>パスワードをリセット</h2>
        </div>

        <p className="subtitle">
          メールで受け取ったリセットコードを入力し、新しいパスワードを設定してください。
        </p>

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

        {/* Success message */}
        {success && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <CheckCircle size={18} />
            <div>
              <p className="font-semibold">パスワードがリセットされました</p>
              <p className="text-sm mt-1">
                ログインページにリダイレクトします...
              </p>
            </div>
          </div>
        )}

        {!success && (
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

            <label htmlFor="code">リセットコード</label>
            <div style={{ position: "relative" }}>
              <Key
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                id="code"
                type="text"
                placeholder="6桁のコードを入力"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={isLoading}
                required
                maxLength={6}
                style={{ paddingLeft: "40px", letterSpacing: "4px", fontSize: "18px", textAlign: "center" }}
              />
            </div>

            <label htmlFor="newPassword">新しいパスワード</label>
            <div style={{ position: "relative" }}>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="新しいパスワード（6文字以上）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label htmlFor="confirmPassword">パスワード（確認）</label>
            <div style={{ position: "relative" }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                  width: "100%",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>リセット中...</span>
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    <span>パスワードをリセット</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="forgot" style={{ textAlign: "center", marginTop: "16px" }}>
          <Link to="/login">ログインページに戻る</Link>
          <span style={{ margin: "0 8px" }}>|</span>
          <Link to="/forgot-password">コードを再送信</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;


