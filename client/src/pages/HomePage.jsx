
import { useState, useEffect } from "react";
import { Link ,useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import Header from "../components/layout/Header";
import { API_BASE_URL } from "../config/api-config";
import "../styles/style.css";


const featureCards = [
  {
    id: "surprise",
    icon: "🎉",
    title: "サプライズ",
    description: "何を食べるか迷っていますか？AIがおすすめの一品を選びます。",
    cta: "試してみる",
  },
  {
    id: "map",
    icon: "📍",
    title: "近くのランチマップ",
    description: "今すぐ歩いて行けるレストランを確認できます。",
    cta: "マップを開く",
  },
  {
    id: "plan",
    icon: "🗓️",
    title: "週間ランチプラン",
    description: "平日のバランスの取れたプランを自動で作成します。",
    cta: "プランを見る",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (cardId) => {
    if (cardId === "map") {
      navigate("/map");
    }
  }
  const [highlightMeals, setHighlightMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch popular dishes from API
  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/dishes/popular?limit=3`);
        
        if (!response.ok) {
          throw new Error("人気料理の取得に失敗しました");
        }
        
        const dishes = await response.json();
        setHighlightMeals(Array.isArray(dishes) ? dishes : []);
      } catch (err) {
        console.error("Error fetching popular dishes:", err);
        setError(err.message || "データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDishes();
  }, []);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="home-page">
      <Header />

      <main className="home-content">
        <section className="hero-section">
          <div className="hero-text">
            <p className="hero-label">今日のおすすめランチ</p>
            <p className="hero-subtitle">
              あなたの好み、天気、予算に合わせた提案で、より早く選べます。
            </p>
            <div className="hero-actions">
              <Link to="/suggest"> 
              <button className="primary-btn">おすすめを見る</button> </Link>
              <button className="ghost-btn">サプライズ</button>
            </div>
          </div>
          <div className="hero-preview">
            <span>おすすめ料理のプレビューエリア / 画像</span>
          </div>
        </section>

        <section className="feature-section">
          {featureCards.map((card) => (
            <article key={card.id} className="feature-card">
              <div className="icon-badge">{card.icon}</div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button
                  className="ghost-btn small"
                  onClick={() => handleFeatureClick(card.id)}
                  type="button"
                >
                  {card.cta}
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="highlights">
          <h2>今日のハイライト</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <span className="ml-2 text-gray-600">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          ) : highlightMeals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ハイライト料理がありません
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highlightMeals.map((meal) => (
                <li key={meal._id} className="highlight-item">
                  <Link 
                    to={`/menu/${meal._id}`}
                    className="flex flex-col h-full hover:bg-gray-50 p-4 rounded-lg transition-colors"
                  >
                    <img
                      src={meal.image || "/images/food.jpg"}
                      alt={meal.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.target.src = "/images/food.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <p className="meal-name font-semibold text-gray-800 mb-2 line-clamp-2">{meal.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="meal-price text-orange-600 font-bold">
                          {formatPrice(meal.price)}
                        </span>
                        {meal.rating > 0 && (
                          <span className="text-sm text-gray-500">
                            ⭐ {meal.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="detail-btn mt-3 w-full text-center"
                    >
                      詳細
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
