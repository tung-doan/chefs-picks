import React, { useState, useEffect } from "react";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import "../styles/SuggestPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../styles/FoodCard.css";
import FoodCard from "../components/common/FoodCard";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";
const API_SUGGEST = `${API_BASE_URL}/omakase`;
const API_CATEGORIES = `${API_BASE_URL}/categories`;

const SuggestPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================== FETCH CATEGORIES ================== */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_CATEGORIES);
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Fetch categories error", err);
    }
  };

  /* ================== TOGGLE CATEGORY ================== */
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  /* ================== FETCH SUGGESTIONS ================== */
  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.post(
        API_SUGGEST,
        {
          categories: selectedCategories, // ✅ array of categoryId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể lấy gợi ý món ăn");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================== EFFECTS ================== */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [selectedCategories]);

  /* ================== RENDER ================== */
  return (
    <div className="suggest-page">
      <button className="btn-home" onClick={() => navigate("/")}>
        🏠 ホームに戻る
      </button>

      <h2 className="title-tech">
        四季彩 <span>AI</span> コンシェルジュ
      </h2>

      <h1>おすすめページ</h1>

      {/* CATEGORY FILTER */}
      <div className="category-bar">
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`category-btn ${
              selectedCategories.includes(cat._id) ? "active" : ""
            }`}
            onClick={() => toggleCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="loading">
          <ClipLoader size={50} />
          <p>読み込み中...</p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && <p className="error">{error}</p>}

      {/* CARDS */}
      {!loading && suggestions.length > 0 && (
        <div
          className={`cards-container ${
            suggestions.length === 1 ? "one-card" : "three-cards"
          }`}
        >
          {suggestions.slice(0, 3).map((item) => (
            <FoodCard key={item._id} food={item} />
          ))}
        </div>
      )}

      {/* RANDOM BUTTON */}
      <button
        className="btn-refresh"
        onClick={() => setSelectedCategories([])}
        disabled={loading}
      >
        <FontAwesomeIcon icon={faRandom} />
        ランダムで選ぶ
      </button>
    </div>
  );
};

export default SuggestPage;
