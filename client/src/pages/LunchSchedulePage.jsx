import React, { useState, useEffect } from "react";
import { Loader2, Calendar, Edit2, Save, Plus, X, AlertCircle } from "lucide-react";
import Header from "../components/layout/Header";
import { lunchScheduleService } from "../services/lunch-schedule-service";
import { API_BASE_URL } from "../config/api-config";
import "../styles/LunchSchedulePage.css";

const LunchSchedulePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Get Monday of current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  });

  const [schedule, setSchedule] = useState(null);
  const [meals, setMeals] = useState([]);
  const [editingMeal, setEditingMeal] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [showDishSelector, setShowDishSelector] = useState(null);
  const [dishSearchTerm, setDishSearchTerm] = useState("");
  const [selectedMealDate, setSelectedMealDate] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Format date short (for calendar header)
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return days[date.getDay()];
  };

  // Format date number
  const formatDateNumber = (dateString) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // Get week dates
  const getWeekDates = (startDate) => {
    const dates = [];
    // Parse startDate (YYYY-MM-DD) and create date in local timezone
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      // Format as YYYY-MM-DD in local timezone
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      dates.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return dates;
  };

  // Fetch schedule for current week
  const fetchSchedule = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("ランチスケジュールを表示するにはログインしてください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await lunchScheduleService.getScheduleByWeek(currentWeekStart);
      
      if (response.success && response.data) {
        setSchedule(response.data);
        // Map meals to week dates
        const weekDates = getWeekDates(currentWeekStart);
        const mealsMap = {};
        
        if (response.data.meals && response.data.meals.length > 0) {
          response.data.meals.forEach((meal) => {
            // Parse date from server (could be ISO string or Date object)
            const mealDate = new Date(meal.date);
            // Get date components in local timezone to avoid timezone issues
            const year = mealDate.getFullYear();
            const month = mealDate.getMonth() + 1;
            const day = mealDate.getDate();
            const normalizedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Handle dishId - could be populated object or just ID
            let dishId = null;
            if (meal.dishId) {
              dishId = typeof meal.dishId === 'object' ? meal.dishId._id || meal.dishId : meal.dishId;
            }
            
            mealsMap[normalizedDate] = {
              date: normalizedDate,
              dishId: dishId,
              notes: meal.notes || ""
            };
          });
        }

        const weekMeals = weekDates.map((date) => {
          // date is already in YYYY-MM-DD format
          return mealsMap[date] || { date: date, dishId: null, notes: "" };
        });

        setMeals(weekMeals);
      } else {
        // No schedule exists, create empty week
        const weekDates = getWeekDates(currentWeekStart);
        const emptyMeals = weekDates.map((date) => ({
          date,
          dishId: null,
          notes: "",
        }));
        setMeals(emptyMeals);
        setSchedule(null);
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err.message || "ランチスケジュールを読み込めませんでした");
      
      // Initialize empty meals on error
      const weekDates = getWeekDates(currentWeekStart);
      const emptyMeals = weekDates.map((date) => ({
        date,
        dishId: null,
        notes: "",
      }));
      setMeals(emptyMeals);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dishes for selection
  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dishes?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const dishesList = Array.isArray(data) ? data : data.dishes || [];
        setDishes(dishesList);
      }
    } catch (err) {
      console.error("Error fetching dishes:", err);
    }
  };

  // Load schedule and dishes on mount and week change
  useEffect(() => {
    fetchSchedule();
    fetchDishes();
  }, [currentWeekStart]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    setCurrentWeekStart(date.toISOString().split("T")[0]);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    setCurrentWeekStart(date.toISOString().split("T")[0]);
  };

  // Navigate to current week
  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday.toISOString().split("T")[0]);
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("スケジュールを保存するにはログインしてください");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Normalize meals data before sending
      const normalizedMeals = meals.map((meal) => {
        // Parse date string (YYYY-MM-DD) and create date in local timezone
        const [year, month, day] = meal.date.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid timezone issues
        
        // Ensure dishId is a string, not an object
        let dishId = null;
        if (meal.dishId) {
          dishId = typeof meal.dishId === 'object' ? (meal.dishId._id || meal.dishId) : meal.dishId;
          dishId = dishId ? dishId.toString() : null;
        }
        return {
          date: date.toISOString(),
          dishId: dishId,
          notes: meal.notes || "",
        };
      });

      await lunchScheduleService.createOrUpdateSchedule(currentWeekStart, normalizedMeals);
      // Refresh to get updated data from server
      await fetchSchedule();
      alert("ランチスケジュールが正常に保存されました！");
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(err.message || "ランチスケジュールを保存できませんでした");
    } finally {
      setSaving(false);
    }
  };


  // Update meal dish
  const handleSelectDish = (date, dishId) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.date === date ? { ...meal, dishId } : meal
      )
    );
    setShowDishSelector(null);
    setSelectedMealDate(null);
    setDishSearchTerm("");
  };

  // Remove dish from meal
  const handleRemoveDish = (date) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.date === date ? { ...meal, dishId: null, notes: "" } : meal
      )
    );
  };

  // Update meal notes
  const handleUpdateNotes = (date, notes) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.date === date ? { ...meal, notes } : meal
      )
    );
  };

  // Get dish by ID
  const getDishById = (dishId) => {
    if (!dishId) return null;
    // Handle both string and object ID
    const id = typeof dishId === 'object' ? dishId._id || dishId : dishId;
    return dishes.find((d) => d._id === id || d._id?.toString() === id?.toString());
  };

  // Filter dishes for search
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(dishSearchTerm.toLowerCase())
  );

  const weekDates = getWeekDates(currentWeekStart);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-orange-500" size={32} />
              ランチスケジュール
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleSaveSchedule}
                disabled={loading || saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    スケジュールを保存
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              ← 先週
            </button>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-700">
                {formatDate(currentWeekStart)} - {formatDate(weekDates[6])}
              </span>
              <button
                onClick={goToCurrentWeek}
                className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                今週
              </button>
            </div>
            <button
              onClick={goToNextWeek}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              来週 →
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
            <p className="text-gray-600">ランチスケジュールを読み込み中...</p>
          </div>
        )}

        {/* Calendar View */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border-b">
              {weekDates.map((date, index) => {
                const meal = meals.find((m) => m.date === date);
                const dish = meal ? getDishById(meal.dishId) : null;
                const dateObj = new Date(date);
                const today = new Date();
                const isToday = 
                  dateObj.getDate() === today.getDate() &&
                  dateObj.getMonth() === today.getMonth() &&
                  dateObj.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={date}
                    className={`calendar-day border-r last:border-r-0 ${
                      isToday ? "bg-orange-50" : "bg-white"
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`p-3 border-b text-center ${
                      isToday ? "bg-orange-500 text-white" : "bg-gray-50"
                    }`}>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {formatDateShort(date)}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday ? "text-white" : "text-gray-800"
                      }`}>
                        {formatDateNumber(date)}
                      </div>
                    </div>

                    {/* Meal Content */}
                    <div 
                      className="p-3 min-h-[200px] cursor-pointer hover:bg-gray-50 transition-colors relative"
                      onClick={() => {
                        setSelectedMealDate(date);
                        setShowDishSelector(date);
                      }}
                    >
                      {dish ? (
                        <div className="space-y-2">
                          <img
                            src={dish.image || "/images/food.jpg"}
                            alt={dish.name}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "/images/food.jpg";
                            }}
                          />
                          <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">
                            {dish.name}
                          </h4>
                          <p className="text-xs text-orange-600 font-bold">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(dish.price)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>⭐</span>
                            <span>{dish.rating || 0}</span>
                          </div>
                          {meal.notes && (
                            <p className="text-xs text-gray-500 italic line-clamp-1">
                              {meal.notes}
                            </p>
                          )}
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMeal(editingMeal === date ? null : date);
                              }}
                              className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                              title="編集"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDish(date);
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="削除"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
                          <Plus size={32} className="mb-2" />
                          <span className="text-xs">料理を選択</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dish Selector Modal */}
        {showDishSelector && selectedMealDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {formatDate(selectedMealDate)}の料理を選択
                </h3>
                <button
                  onClick={() => {
                    setShowDishSelector(null);
                    setSelectedMealDate(null);
                    setDishSearchTerm("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 border-b">
                <input
                  type="text"
                  placeholder="料理を検索..."
                  value={dishSearchTerm}
                  onChange={(e) => setDishSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                {filteredDishes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    料理が見つかりません
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredDishes.map((d) => (
                      <div
                        key={d._id}
                        onClick={() => handleSelectDish(selectedMealDate, d._id)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={d.image || "/images/food.jpg"}
                          alt={d.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/images/food.jpg";
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{d.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(d.price)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <span>⭐</span>
                            <span>{d.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes Editor Modal */}
        {editingMeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {formatDate(editingMeal)}のメモ
                </h3>
                <button
                  onClick={() => setEditingMeal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <textarea
                value={meals.find(m => m.date === editingMeal)?.notes || ""}
                onChange={(e) => handleUpdateNotes(editingMeal, e.target.value)}
                placeholder="メモを追加..."
                className="w-full p-3 border rounded-lg mb-4"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LunchSchedulePage;

