import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import "../styles/style.css";
import { API_BASE_URL } from "../config/api-config";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }

    if (!email.includes("@")) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "リセットコードの送信に失敗しました");
        setIsLoading(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        // Lưu email vào localStorage để dùng ở trang reset
        localStorage.setItem("resetEmail", email);
      } else {
        setError("予期しないエラーが発生しました");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
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
          <h2>パスワードを忘れた場合</h2>
        </div>

        <p className="subtitle">
          メールアドレスを入力してください。リセットコードをお送りします。
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
              <p className="font-semibold">メールを送信しました</p>
              <p className="text-sm mt-1">
                メールアドレス {email} にリセットコードを送信しました。
                メールを確認して、次のステップに進んでください。
              </p>
            </div>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">メールアドレス</label>
            <div style={{ position: "relative" }}>
              <Mail
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
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                style={{ paddingLeft: "40px" }}
              />
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
                    <span>送信中...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>リセットコードを送信</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="btn-row">
            <button
              onClick={() => navigate("/reset-password")}
              className="btn-signin"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
              }}
            >
              <span>リセットコードを入力</span>
            </button>
          </div>
        )}

        <div className="forgot" style={{ textAlign: "center", marginTop: "16px" }}>
          <Link to="/login">ログインページに戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


