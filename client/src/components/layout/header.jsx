import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import "../../styles/style.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Kiểm tra user đã đăng nhập chưa
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    if (userStr && token) {
      try {
        setUser(JSON.parse(userStr));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu]);

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setShowUserMenu(false);
    navigate("/login");
  };

  // Kiểm tra route hiện tại có active không
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="home-header">
      <div className="brand">
        <div>
          <span className="brand-name">Chef&apos;s Recommendation Menu</span>
          <span className="beta-pill">Beta</span>
        </div>
      </div>

      <div className="header-actions">
        <nav className="home-nav-links">
          <Link className={isActive("/") ? "active" : ""} to="/">
            ホーム
          </Link>
          <Link className={isActive("/menu") || location.pathname.startsWith("/menu/") ? "active" : ""} to="/menu">
            メニュー
          </Link>
          
          {/* Chỉ hiển thị các link sau khi đã đăng nhập */}
          {user && (
            <>
              <Link className={isActive("/favorites") ? "active" : ""} to="/favorites">
                お気に入り
              </Link>
              <Link className={isActive("/lunch-schedule") ? "active" : ""} to="/lunch-schedule">
                昼食のスケジュール
              </Link>
              <Link className={isActive("/todays-picks") ? "active" : ""} to="/todays-picks">
                今日のおすすめ
              </Link>
              <Link className={isActive("/surprise-me") ? "active" : ""} to="/surprise-me">
                サプライズ
              </Link>
              <Link className={isActive("/map") ? "active" : ""} to="/map">
                近く
              </Link>
              <Link className={isActive("/history") ? "active" : ""} to="/history">
                履歴
              </Link>
            </>
          )}
        </nav>

        {user ? (
          <div
            data-user-menu
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#f97316",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#ea580c")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f97316")}
            >
              <User size={18} />
              <span>{user.name || user.email}</span>
            </button>

            {showUserMenu && (
              <div
                data-user-menu
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  minWidth: "200px",
                  zIndex: 1000,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>
                    {user.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#dc2626",
                    transition: "background-color 0.2s",
                    borderRadius: "0 0 8px 8px",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#fef2f2")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  <LogOut size={16} />
                  <span>ログアウト</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className="login-btn">ログイン</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

