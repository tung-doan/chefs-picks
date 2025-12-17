import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api-config';
import Header from '../components/layout/Header';

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
  const [favoriteLoading, setFavoriteLoading] = useState({}); // Track loading state per dish
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5; // Số món ăn mỗi trang

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Load favorites từ API khi component mount
  useEffect(() => {
    const loadFavorites = async () => {
      const token = getAuthToken();
      if (!token) {
        // Nếu chưa đăng nhập, load từ localStorage như cũ
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        return;
      }

      try {
        // Lấy danh sách favorites từ API
        const response = await fetch(`${API_BASE_URL}/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.favorites) {
            // Lấy danh sách dishId từ favorites
            const favoriteIds = data.data.favorites.map(fav => fav.dishId.toString());
            setFavorites(favoriteIds);
          }
        }
      } catch (err) {
        console.error('Error loading favorites:', err);
        // Fallback to localStorage nếu API fail
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    };

    loadFavorites();
  }, []);

  // Fetch dishes khi component mount hoặc filters thay đổi
  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [cuisine, priceRange, sortBy, searchTerm]);
  
  // Fetch dishes khi page hoặc filters thay đổi
  useEffect(() => {
    fetchDishes(currentPage);
  }, [currentPage, cuisine, priceRange, sortBy, searchTerm]);

  const fetchDishes = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/dishes`;
      const params = new URLSearchParams();
      
      // Thêm pagination params cho endpoint chính
      let usePagination = false;

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
      } else {
        // Endpoint chính hỗ trợ pagination
        usePagination = true;
        params.append('page', page);
        params.append('limit', itemsPerPage);
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
      
      // Xử lý pagination nếu có
      if (usePagination && data.pagination) {
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } else {
        // Nếu không có pagination từ server, tính toán client-side
        const total = dishes.length;
        const totalPagesCalc = Math.ceil(total / itemsPerPage);
        setTotalPages(totalPagesCalc);
        setTotalItems(total);
        
        // Pagination client-side
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        dishes = dishes.slice(startIndex, endIndex);
      }

      // Sort client-side nếu cần (chỉ khi không phải endpoint chính)
      if (!usePagination) {
        if (sortBy === 'price-low') {
          dishes.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          dishes.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'popular') {
          dishes.sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
        }
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

  const toggleFavorite = async (dishId) => {
    const token = getAuthToken();
    
    // Nếu chưa đăng nhập, yêu cầu đăng nhập
    if (!token) {
      alert('お気に入り機能を使用するにはログインが必要です。');
      return;
    }

    const isFavorite = favorites.includes(dishId);
    setFavoriteLoading(prev => ({ ...prev, [dishId]: true }));

    try {
      if (isFavorite) {
        // Xóa khỏi yêu thích
        const response = await fetch(`${API_BASE_URL}/favorites/${dishId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFavorites(prev => prev.filter(id => id !== dishId));
          }
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'お気に入りから削除できませんでした');
        }
      } else {
        // Thêm vào yêu thích
        const response = await fetch(`${API_BASE_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dishId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFavorites(prev => [...prev, dishId]);
          }
        } else {
          const errorData = await response.json();
          if (response.status === 409) {
            // Đã có trong danh sách, cập nhật state
            setFavorites(prev => [...prev, dishId]);
          } else {
            alert(errorData.message || 'お気に入りに追加できませんでした');
          }
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('ネットワークエラーが発生しました');
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [dishId]: false }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCuisine('');
    setPriceRange('');
    setSortBy('popular');
    setCurrentPage(1);
  };
  
  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      <Header />
      
      {/* Search and Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
      </div>

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
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="お気に入りに追加"
                        disabled={favoriteLoading[item._id]}
                      >
                        {favoriteLoading[item._id] ? (
                          <Loader2 size={20} className="animate-spin text-orange-500" />
                        ) : (
                          <Heart
                            size={20}
                            className={favorites.includes(item._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                          />
                        )}
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
            
            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                  <span>前へ</span>
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 min-w-[40px] border rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <span>次へ</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            
            {/* Pagination info */}
            {totalPages > 1 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                ページ {currentPage} / {totalPages} ({totalItems} 件中)
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Menu;