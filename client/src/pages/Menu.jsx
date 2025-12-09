import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Home, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api-config';

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);

  // Load favorites từ localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch dishes khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchDishes();
  }, [cuisine, priceRange, sortBy, searchTerm]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/dishes`;
      const params = new URLSearchParams();

      // Xử lý search
      if (searchTerm.trim()) {
        url = `${API_BASE_URL}/dishes/search`;
        params.append('q', searchTerm);
      }
      // Xử lý filter by category
      else if (cuisine) {
        // Lấy categoryId từ tên category
        const category = categories.find(cat => cat.name === cuisine);
        if (category) {
          url = `${API_BASE_URL}/dishes/category/${category._id}`;
        }
      }
      // Xử lý filter by price range
      else if (priceRange) {
        url = `${API_BASE_URL}/dishes/price`;
        const ranges = {
          'low': { min: 0, max: 500 },
          'mid': { min: 500, max: 1000 },
          'high': { min: 1000, max: 10000 }
        };
        if (ranges[priceRange]) {
          params.append('min', ranges[priceRange].min);
          params.append('max', ranges[priceRange].max);
        }
      }
      // Xử lý popular
      else if (sortBy === 'popular') {
        url = `${API_BASE_URL}/dishes/popular`;
        params.append('limit', 50);
      }

      // Thêm params vào URL
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dishes');
      }

      const data = await response.json();
      
      // Xử lý data tùy theo response format
      let dishes = Array.isArray(data) ? data : (data.dishes || []);

      // Sort client-side nếu cần
      if (sortBy === 'price-low') {
        dishes.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        dishes.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'popular') {
        dishes.sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
      }

      setMenuItems(dishes);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dishes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : (data.categories || []));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleFavorite = (id) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id) 
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCuisine('');
    setPriceRange('');
    setSortBy('popular');
  };

  // Format price theo VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-orange-500 mb-4">
            <Home size={20} />
            <span className="font-medium">ホーム</span>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="メニューを検索（例： curry, ramen, salad）"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            >
              <option value="">料理</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            >
              <option value="">価格帯</option>
              <option value="low">500未満</option>
              <option value="mid">500 - 1000</option>
              <option value="high">1000以上</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            >
              <option value="popular">人気順</option>
              <option value="price-low">価格：安い順</option>
              <option value="price-high">価格：高い順</option>
            </select>
            
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              クリア
            </button>
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={24} />
            <div>
              <p className="font-semibold">料理の読み込みエラー</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <Link
                  to={`/menu/${item._id}`}
                  key={item._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
                >
                  <div className="relative h-48 bg-gray-200">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        {item.categoryId && (
                          <span className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded mt-1">
                            {typeof item.categoryId === 'object' ? item.categoryId.name : item.categoryId}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(item._id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="お気に入りに追加"
                      >
                        <Heart
                          size={20}
                          className={favorites.includes(item._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>評価：</span>
                        <span className="text-yellow-500">★</span>
                        <span>({item.rating || 0})</span>
                      </div>
                      <span className="text-xl font-bold text-orange-600">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    
                    {!item.isAvailable && (
                      <div className="mt-2 text-center text-sm text-red-600 bg-red-50 py-1 rounded">
                        現在利用できません
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {menuItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                条件に一致する商品が見つかりません
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Menu;