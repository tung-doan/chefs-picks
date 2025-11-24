import "../styles/style.css";

const featureCards = [
  {
    id: "surprise",
    icon: "🎉",
    title: "Surprise Me",
    description: "Not sure what to eat? Get a single bold pick from AI.",
    cta: "Try once",
  },
  {
    id: "map",
    icon: "📍",
    title: "Nearby Lunch Map",
    description: "See restaurants you can walk to right now.",
    cta: "Open map",
  },
  {
    id: "plan",
    icon: "🗓️",
    title: "Weekly Lunch Plan",
    description: "Auto-build a balanced plan for your weekdays.",
    cta: "See plan",
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
      <header className="home-header">
        <div className="brand">
          <div>
            <span className="brand-name">Chef&apos;s Recommendation Menu</span>
            <span className="beta-pill">Beta</span>
          </div>
        </div>

        <div className="header-actions">
          <nav className="home-nav-links">
            <a className="active" href="#">
              Home
            </a>
            <a href="#">Today&apos;s Picks</a>
            <a href="#">Surprise Me</a>
            <a href="#">Nearby</a>
            <a href="#">History</a>
            <a href="#">Favorites</a>
          </nav>

          <button className="login-btn">Login</button>
        </div>
      </header>

      <main className="home-content">
        <section className="hero-section">
          <div className="hero-text">
            <p className="hero-label">Today&apos;s Recommended Lunch</p>
            <p className="hero-subtitle">
              Choose faster with suggestions tailored to your taste, weather, and
              budget.
            </p>
            <div className="hero-actions">
              <button className="primary-btn">View Recommendations</button>
              <button className="ghost-btn">Surprise Me</button>
            </div>
          </div>
          <div className="hero-preview">
            <span>Preview area for recommended dishes / images</span>
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
          <h2>Highlights Today</h2>
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
                <button className="detail-btn">Details</button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
