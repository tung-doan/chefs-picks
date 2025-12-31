import { useState, useEffect } from "react"; // Thêm useEffect
import Header from "../components/layout/Header";
import { restaurants } from "../features/lunchConcierge/data/restaurants";
import LunchMap from "../features/lunchConcierge/components/LunchMap";
import useLunchMapController from "../features/lunchConcierge/hooks/useLunchMapController";
import PopularSpotsList from "../features/lunchConcierge/components/PopularSpotsList";

const LunchConciergeMapPage = () => {
  const [searchText, setSearchText] = useState("");
  const { selectedId, setSelectedId, setMap, flyToRestaurant } =
    useLunchMapController();

  // 1. Tạo danh sách đã lọc
  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 2. Reset selectedId khi người dùng thay đổi từ khóa tìm kiếm
  // (Để tránh việc đang chọn nhà hàng A, tìm kiếm nhà hàng B thì map bị đơ)
  useEffect(() => {
    setSelectedId(null);
  }, [searchText, setSelectedId]);

  // 3. Xử lý khi click vào thẻ bên phải
  const handleCardClick = (restaurant) => {
    // Không cần quan tâm index là bao nhiêu, chỉ cần ID và object
    setSelectedId(restaurant.id);
    flyToRestaurant(restaurant);
  };

  // 4. Xử lý khi click vào Marker trên bản đồ
  const handleMarkerClick = (id) => {
    // Tìm nhà hàng trong danh sách gốc (restaurants) để chắc chắn luôn tìm thấy dữ liệu
    // dù danh sách filtered đang hiển thị cái gì
    const restaurant = restaurants.find((r) => r.id === id);

    if (restaurant) {
      setSelectedId(id);
      flyToRestaurant(restaurant);
    }
  };

  return (
    <div
      className="min-h-screen text-[#4A3B32]"
      style={{ backgroundColor: "#F3EFE6" }}
    >
      <Header />
      <div className="px-4 py-10 md:px-10">
        <header className="mx-auto mb-8 max-w-5xl text-center">
          <h1 className="text-2xl font-semibold tracking-[0.35em] text-[#4A3B32] md:text-3xl">
            四季彩AIコンシェルジュ
          </h1>
        </header>

        <main className="mx-auto max-w-5xl">
          <div
            className="grid gap-6 p-6 md:grid-cols-[3fr_2fr]"
            style={{
              borderRadius: "20px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 45px rgba(74, 59, 50, 0.12)",
            }}
          >
            <section className="flex flex-col gap-4">
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderRadius: "18px",
                  backgroundColor: "#F8F1E7",
                  boxShadow: "0 12px 24px rgba(74, 59, 50, 0.08)",
                }}
              >
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9A7F6E] whitespace-nowrap">
                  検索
                </span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="近くのランチを探す ..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#B7A79A]"
                />
              </div>
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 18px 32px rgba(74, 59, 50, 0.18)",
                }}
              >
                <LunchMap
                  restaurants={filteredRestaurants} // Map chỉ hiển thị những cái đã lọc
                  activeId={selectedId}
                  onMapReady={setMap}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </section>

            <PopularSpotsList
              restaurants={filteredRestaurants} // List chỉ hiển thị những cái đã lọc
              activeId={selectedId}
              // Truyền thẳng hàm handleCardClick, bỏ qua index
              onSelect={handleCardClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LunchConciergeMapPage;
