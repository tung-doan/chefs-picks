import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { Loader2, Trash2 } from 'lucide-react';
import Header from '../components/layout/header'; 

// お気に入りAPIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_URL;// トークンをローカルストレージから取得
const AUTH_TOKEN = localStorage.getItem('authToken'); 

export default function FavoriteFood() {
    // 1. ステートの初期化 (ページネーションを追加)
    const [お気に入りリスト, setお気に入りリスト] = useState([]);
    const [ロード中, setロード中] = useState(true);
    const [エラー, setエラー] = useState(null);
    
    // ページネーションのステート
    const [現在ページ, set現在ページ] = useState(1);
    const [全ページ数, set全ページ数] = useState(1);
    const limit = 5; // 1ページあたりの表示件数
    
    // API呼び出し用のヘッダー設定
    const apiConfig = {
        headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
        },
    };

    // 2. お気に入りリスト取得API呼び出し関数 (ページネーション対応)
    const fetchFavorites = async (page = 1) => {
        // トークンチェック
        if (!AUTH_TOKEN) {
            setエラー("お気に入りリストを表示するにはログインが必要です。");
            setロード中(false);
            return;
        }

        setロード中(true);
        setエラー(null);
        try {
            // APIクエリにページネーションパラメータを追加
            const response = await axios.get(`${API_BASE_URL}?page=${page}&limit=${limit}`, apiConfig);

            setお気に入りリスト(response.data.data.favorites); 
            set現在ページ(response.data.data.pagination.currentPage);
            set全ページ数(response.data.data.pagination.totalPages);

        } catch (err) {
            console.error("お気に入りリスト取得エラー:", err);
            if (err.response && err.response.status === 401) {
                setエラー("セッションの有効期限が切れました。再ログインしてください。");
            } else {
                setエラー("お気に入りリストを読み込めませんでした。ネットワークを確認してください。");
            }
        } finally {
            setロード中(false);
        }
    };

    // ページ切り替え処理
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= 全ページ数) {
            fetchFavorites(pageNumber);
        }
    };
    
    // お気に入りの削除処理 (DELETE)
    const handleRemoveFavorite = async (dishIdToRemove) => {
        if (!window.confirm("この料理をお気に入りリストから削除してもよろしいですか？")) {
            return;
        }
        if (!AUTH_TOKEN) {
             alert("お気に入りを削除するにはログインが必要です。");
             return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/${dishIdToRemove}`, apiConfig);
            alert("お気に入りから削除されました！");
            
            // 現在のページを再読み込み
            fetchFavorites(現在ページ); 

        } catch (err) {
            console.error("お気に入り削除エラー:", err);
            const errorMessage = err.response?.data?.message || "お気に入り削除中に不明なエラーが発生しました。";
            alert(`エラー: ${errorMessage}`);
        }
    };

    // 5. 初回ロード
    useEffect(() => {
        fetchFavorites(1); 
    }, []);

    const dishesToShow = お気に入りリスト.map(fav => ({
        id: fav.dishId, 
        ...fav.dish, 
        img: fav.dish.image 
    }));


    return (
        <div className="w-full min-h-screen bg-orange-50 flex flex-col">
            <Header />
            
            <div className="flex flex-col items-center py-10">
            {/* タイトル */}
            <div className="w-3/4 bg-orange-400 text-white py-4 rounded-t-xl text-2xl font-bold shadow text-center">
                お気に入り料理 ({お気に入りリスト.length} 件)
            </div>

            {/* お気に入りリストコンテンツ */}
            <div className="w-3/4 bg-white rounded-b-xl shadow-xl p-8 space-y-4 min-h-[200px] flex flex-col">
                {ロード中 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-orange-500 mr-2" />
                        <span className="text-gray-700 font-medium">お気に入りリストを読み込み中です...</span>
                    </div>
                ) : エラー ? (
                    <div className="flex-1 flex items-center justify-center text-red-600 font-semibold text-center">
                        {エラー}
                    </div>
                ) : dishesToShow.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-center">
                        現在、お気に入りリストは空です。
                    </div>
                ) : (
                    dishesToShow.map((dish) => (
                        <div
                            key={dish.id}
                            className="flex items-center justify-between bg-orange-50 rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <img 
                                    src={dish.img} 
                                    alt={dish.name} 
                                    className="w-14 h-14 object-cover rounded-lg shadow" 
                                />
                                <div>
                                    <h3 className="font-bold text-lg">{dish.name}</h3>
                                    <p className="text-sm text-gray-600 -mt-1">カテゴリ: {dish.categoryId?.name || 'N/A'}</p> 
                                    <p className="text-sm text-gray-500">{dish.description}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className="text-orange-600 font-bold">${dish.price}</span> 
                                <button 
                                    onClick={() => handleRemoveFavorite(dish.id)}
                                    className="flex items-center gap-1 px-4 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition"
                                >
                                    <Trash2 size={16}/> 削除
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ページネーションコンポーネント */}
            {!ロード中 && !エラー && 全ページ数 > 1 && (
                <div className="w-3/4 mt-4 flex justify-center items-center gap-3 p-4 bg-white rounded-xl shadow">
                    <button
                        onClick={() => handlePageChange(現在ページ - 1)}
                        disabled={現在ページ === 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                        前のページ
                    </button>
                    <span className="font-semibold">
                        ページ {現在ページ} / {全ページ数}
                    </span>
                    <button
                        onClick={() => handlePageChange(現在ページ + 1)}
                        disabled={現在ページ === 全ページ数}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                        次のページ
                    </button>
                </div>
            )}
            </div>
        </div>
    );
}