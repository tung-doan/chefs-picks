import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  Utensils,
  Clock,
  ChevronRight,
  ChevronLeft,
  ShoppingCart
} from 'lucide-react';
import { API_BASE_URL } from '../config/api-config';
import Header from '../components/layout/header';

const formatPrice = (price) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(price || 0);

const ITEMS_PER_PAGE = 5;

const MealHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const fetchHistory = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/history/user/${userId}`);
      if (!response.ok) {
        throw new Error('履歴の取得に失敗しました');
      }

      const data = await response.json();
      const sortedData = data.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );

      setHistory(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  useEffect(() => {
    const total = history.length;
    setTotalItems(total);
    setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

    if (currentPage > Math.ceil(total / ITEMS_PER_PAGE)) {
      setCurrentPage(1);
    }
  }, [history]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReorder = async (item) => {
    try {
      if (!userId) {
        alert('ログインしてください');
        return;
      }

      const reorderData = {
        userId,
        dishId: item.dishId?._id || item.dishId,
        restaurantId: item.restaurantId?._id || item.restaurantId,
        price: item.price
      };

      const response = await fetch(`${API_BASE_URL}/dishes/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData)
      });

      if (response.ok) {
        alert('再注文が完了しました');
        fetchHistory();
      } else {
        const result = await response.json();
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  return (
    <div className="w-full min-h-screen bg-orange-50 flex flex-col">
      <Header />

      <main className="flex flex-col items-center py-10">
        <div className="w-3/4 bg-orange-400 text-white py-4 rounded-t-xl text-2xl font-bold shadow text-center">
          食事履歴
        </div>

        <div className="w-3/4 bg-white rounded-b-xl shadow-xl p-8 min-h-[400px] flex flex-col">
          <p className="text-gray-600 mb-4 border-b pb-2">
            過去に注文した料理の一覧です。
          </p>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
              <span className="text-gray-700 font-medium">
                読み込み中...
              </span>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-600 font-semibold">
              <AlertCircle className="mr-2" /> {error}
            </div>
          ) : history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Utensils className="text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 mb-6">
                注文履歴がありません。
              </p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600"
              >
                メニューを見る
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 flex-1">
                {currentItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-orange-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-5">
                      <img
                        src={item.dishId?.image || 'https://via.placeholder.com/100'}
                        alt={item.dishId?.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />

                      <div>
                        <h3 className="font-bold text-lg">
                          {item.dishId?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.restaurantId?.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Clock size={14} />
                          {new Date(item.orderDate).toLocaleString('ja-JP')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className="text-orange-600 font-bold text-xl">
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/menu/${item.dishId?._id}`)
                          }
                          className="px-4 py-1.5 border border-orange-200 bg-white text-orange-500 rounded-lg text-sm flex items-center gap-1"
                        >
                          詳細 <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => handleReorder(item)}
                          className="flex items-center gap-1 px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm"
                        >
                          <ShoppingCart size={14} /> 再注文
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <>
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                      <span>前へ</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2)
                          pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 min-w-[40px] border rounded-lg ${
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
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      <span>次へ</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    ページ {currentPage} / {totalPages} ({totalItems} 件中)
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MealHistory;
