import "../../styles/FoodCard.css";

export default function FoodCard({ food }) {
  return (
    <div className="food-card">
      <img src={food.image} alt={food.name} className="food-img" />

      <div className="food-info">
        <h3>{food.name}</h3>
        <p>{food.restaurant}</p>
        <p className="price">{food.price}</p>
        <p className="rating">⭐ {food.rating}</p>
      </div>
    </div>
  );
}