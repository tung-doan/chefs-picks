import React, { useState, useEffect } from "react";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import "../styles/SuggestPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom } from "@fortawesome/free-solid-svg-icons"; 

const API_URL = "http://localhost:5000/api/favorites";

const MOCK_DATA = [
  {
    name: "Cơm gà xối mỡ",
    restaurant: "Quán A",
    price: "45.000đ",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1604909053176-30c2f3eac5bf?q=80&w=1200"
  },
  {
    name: "Bún bò Huế",
    restaurant: "Quán B",
    price: "40.000đ",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1604908177522-0404d59ebf07?q=80&w=1200"
  },
  {
    name: "Mì Ý sốt bò bằm",
    restaurant: "Quán C",
    price: "55.000đ",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1601924582971-d7454f3b779a?q=80&w=1200"
  }
];

const SuggestPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(API_URL);

      if (res.data && res.data.data && res.data.data.length > 0) {
        setSuggestions(res.data.data);
      } else {
        setError("No suggestions found.");
        setSuggestions([]);
      }
    } catch (err) {
      console.error(err);
      setError();
      setSuggestions(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="suggest-page">
      <div className="page-header">
        <h2>Shikiai AI CONCIERGE</h2>
      </div>
      <h1>Suggest Page</h1>

      {loading && (
        <div className="loading">
          <ClipLoader color="#ff6f00" size={50} />
          <p>Loading ...</p>
        </div>
      )}

      {error && !loading && <p className="error">{error}</p>}

      {!loading && suggestions.length > 0 && (
        <div className="cards-container">
          {suggestions.map((item, idx) => (
            <div className="card" key={idx}>
              <div className="card-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="card-content">
                <h3>{item.name}</h3>
                <p className="restaurant">{item.restaurant}</p>
                <p className="price">{item.price}</p>
                <p className="rating">⭐ {item.rating}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn-refresh"
        onClick={fetchSuggestions}
        disabled={loading}
      >
        <FontAwesomeIcon icon={faRandom} style={{ marginRight: "8px" }} />
        Random Pick
      </button>
    </div>
  );
};

export default SuggestPage;
