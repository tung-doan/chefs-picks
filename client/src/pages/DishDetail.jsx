import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2, Star, MapPin, Utensils, ShoppingCart, Check, User } from 'lucide-react';
import { API_BASE_URL } from '../config/api-config';

const fallbackImage =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';

const formatPrice = (price) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(
    price || 0
  );

// Hàm quản lý giỏ hàng với localStorage
const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

const addToCart = (dish) => {
  const cart = getCart();
  const existingItem = cart.find(item => item._id === dish._id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...dish, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

// Dữ liệu đánh giá mẫu (fix cứng)
const sampleReviews = [
  {
    id: 1,
    userName: '田中 太郎',
    avatar: null,
    rating: 5,
    comment: 'とても美味しかったです！香りが良く、スパイスが絶妙なバランスでした。また注文したいです。',
    date: '2024年1月15日',
    helpful: 12
  },
  {
    id: 2,
    userName: '佐藤 花子',
    avatar: null,
    rating: 4,
    comment: '期待以上でした。量も十分で、価格もリーズナブル。次回も試してみたいです。',
    date: '2024年1月10日',
    helpful: 8
  },
  {
    id: 3,
    userName: '鈴木 一郎',
    avatar: null,
    rating: 5,
    comment: '最高の味でした！材料も新鮮で、調理も完璧。家族にも勧めたいです。',
    date: '2024年1月8日',
    helpful: 15
  },
  {
    id: 4,
    userName: '山田 美咲',
    avatar: null,
    rating: 4,
    comment: 'とても満足しました。見た目も美しく、味も素晴らしかったです。',
    date: '2024年1月5日',
    helpful: 6
  }
];

// Mô tả chi tiết mẫu (fix cứng)
const sampleDetailedDescription = {
  'Butter Chicken Curry': 'バターチキンカレーは、トマトベースのクリーミーなソースにマリネしたチキンを煮込んだ、インド料理の定番メニューです。バターとクリームの豊かな風味が特徴で、スパイスが絶妙に調和しています。',
  'Green Curry': 'グリーンカレーは、タイ料理の代表的なカレーです。ココナッツミルクベースのまろやかな味わいと、グリーンカレーペーストの爽やかな辛さが特徴です。',
  'Miso Ramen': '味噌ラーメンは、濃厚な味噌ベースのスープに、もちもちの麺とトッピングが絶妙にマッチした一品です。',
  'Shoyu Ramen': '醤油ラーメンは、伝統的な醤油ベースのスープが特徴のクラシックなラーメンです。',
  'Beef Bowl': '牛丼は、甘辛いタレで煮込んだ牛肉を、ふっくらとしたご飯の上にのせた、日本の定番メニューです。',
  'Chicken & Egg Bowl': '親子丼は、鶏肉と卵を甘辛いタレで煮込んだ、優しい味わいの一品です。',
  'Fresh Salad Bowl': 'フレッシュサラダボウルは、季節の野菜をふんだんに使用した、ヘルシーで彩り豊かなサラダです。',
  'Tofu Salad': '豆腐サラダは、柔らかい豆腐と新鮮な野菜を組み合わせた、ヘルシーなメニューです。',
  'Pork Cutlet Set': 'とんかつ定食は、サクサクの衣に包まれたジューシーな豚肉と、ご飯、味噌汁がセットになった定食です。',
  'Tempura Set': '天ぷらセットは、エビや野菜をサクサクに揚げた天ぷらと、特製のタレがセットになった一品です。'
};

const DishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/dishes/${id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '料理の取得に失敗しました');
        }
        const data = await response.json();
        setDish(data);
        
        // Kiểm tra xem món đã có trong giỏ hàng chưa
        const cart = getCart();
        setIsInCart(cart.some(item => item._id === data._id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  const handleAddToCart = () => {
    if (!dish) return;
    
    addToCart(dish);
    setIsInCart(true);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleOrder = () => {
    if (!dish) return;
    
    // Thêm vào giỏ hàng nếu chưa có
    if (!isInCart) {
      addToCart(dish);
    }
    
    // Chuyển đến trang giỏ hàng (hoặc trang thanh toán)
    navigate('/cart');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <Loader2 className="animate-spin text-orange-500 mb-3" size={36} />
          <p>読み込み中です...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
          <AlertCircle size={22} className="mt-0.5" />
          <div>
            <p className="font-semibold">料理を読み込めませんでした</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (!dish) {
      return (
        <div className="text-center text-gray-600 py-12">
          指定された料理が見つかりません。
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Phần ảnh - Bên trái, chiều dọc */}
        <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex justify-center items-center">
          <img
            src={dish.image || fallbackImage}
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
          />
          {!dish.isAvailable && (
            <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              ただいま提供停止中
            </div>
          )}
          {/* Overlay gradient để text dễ đọc hơn */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Phần thông tin - Bên phải, dọc theo ảnh */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 flex flex-col justify-between">

          <div>
            <p className="text-sm text-orange-500 font-semibold mb-2">料理詳細</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{dish.name}</h1>
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">
              {formatPrice(dish.price)}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full">
              <Star size={16} className="text-orange-500" />
              評価 {dish.rating || 0}
            </span>
            {dish.categoryId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                <Utensils size={16} />
                カテゴリ: {dish.categoryId.name || dish.categoryId}
              </span>
            )}
            {dish.restaurantId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                <MapPin size={16} />
                {dish.restaurantId.name || 'レストラン'}
              </span>
            )}
          </div>

            {/* Mô tả ngắn */}
            {dish.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">紹介</p>
                <p className="text-gray-800 leading-relaxed">{dish.description}</p>
              </div>
            )}

            {/* Mô tả chi tiết (fix cứng) */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
              <p className="text-sm font-semibold text-orange-700 mb-2">詳細説明</p>
              <p className="text-gray-800 leading-relaxed text-sm">
                {sampleDetailedDescription[dish.name] || 
                  'こちらの料理は、厳選された食材を使用し、伝統的な調理法で丁寧に仕上げました。新鮮な材料と職人の技術が生み出す、特別な味わいをお楽しみください。'}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500">主な材料</p>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients && dish.ingredients.length > 0 ? (
                  dish.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-600 text-sm">材料情報はありません</span>
                )}
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 mb-6">
              <p className="text-sm text-gray-500 mb-2">提供状況</p>
              <p className="text-gray-800 font-medium">
                {dish.isAvailable ? '提供中' : 'ただいま停止中'}
              </p>
            </div>
          </div>

          {/* Nút thêm giỏ hàng và đặt hàng - Ở cuối */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={!dish.isAvailable}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white transition-all ${
                  dish.isAvailable
                    ? isInCart
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {showSuccess ? (
                  <>
                    <Check size={20} />
                    <span>追加しました</span>
                  </>
                ) : isInCart ? (
                  <>
                    <Check size={20} />
                    <span>カートに追加済み</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>カートに追加</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleOrder}
                disabled={!dish.isAvailable}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all ${
                  dish.isAvailable
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                注文する
              </button>
          </div>
        </div>

        {/* Phần đánh giá (Reviews) - Full width */}
        <div className="lg:col-span-2 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">お客様のレビュー</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < Math.round(sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length}.0
                  </span>
                  <span className="text-sm text-gray-500">
                    ({sampleReviews.length}件のレビュー)
                  </span>
                </div>
              </div>
            </div>

            {/* Danh sách reviews */}
            <div className="space-y-6">
              {sampleReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={24} className="text-orange-600" />
                      )}
                    </div>

                    {/* Review content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>役に立った ({review.helpful})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút xem thêm reviews (nếu có) */}
            <div className="mt-6 text-center">
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                すべてのレビューを見る →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>戻る</span>
          </button>
          <span className="text-sm text-gray-400">/ 料理詳細</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default DishDetail;
