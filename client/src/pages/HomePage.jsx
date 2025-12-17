import Header from "../components/layout/Header";
import "../styles/style.css";
import { Link } from "react-router-dom";

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

const highlightMeals = [
  { id: 1, icon: "🍛", name: "Butter Chicken Curry", price: "¥780" },
  { id: 2, icon: "🍜", name: "Shoyu Ramen", price: "¥750" },
  { id: 3, icon: "🥗", name: "Chicken Salad", price: "¥680" },
];

const HomePage = () => {

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
                <button className="ghost-btn small">{card.cta}</button>
              </div>
            </article>
          ))}
        </section>

        <section className="highlights">
          <h2>今日のハイライト</h2>
          <ul>
            {highlightMeals.map((meal) => (
              <li key={meal.id} className="highlight-item">
                <div className="highlight-info">
                  <span className="icon-circle">{meal.icon}</span>
                  <div>
                    <p className="meal-name">{meal.name}</p>
                    <span className="meal-price">{meal.price}</span>
                  </div>
                </div>
                <button className="detail-btn">詳細</button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
