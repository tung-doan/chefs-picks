import "../../styles/FoodCard.css";
import { useNavigate } from "react-router-dom";

export default function FoodCard({ food }) {
   const navigate = useNavigate();

  return (
    <div 
      className="food-card"
      onClick={() => navigate(`/dish/${food._id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="food-img-wrapper">
      <img src={food.image} alt={food.name} className="food-img" />
       </div>
      <div className="food-info">
        <h3>{food.name}</h3>
        <p>{food.restaurant}</p>
        <p className="price">{food.price}</p>
        <p className="rating">⭐ {food.rating}</p>
      </div>
    </div>
  );
}
