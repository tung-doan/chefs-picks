import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

const PopularSpotsList = ({ restaurants, activeId, onSelect }) => (
  <section className="flex h-full flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-[0.3em] text-[#9A7F6E]">
        人気スポット
      </h2>
    </div>
    <div className="flex flex-col gap-4">
      {restaurants.map((restaurant) => (
        <button
          key={restaurant.name}
          type="button"
          onClick={() => onSelect(restaurant)}
          className="flex w-full items-center gap-4 text-left transition-transform duration-300 hover:-translate-y-1"
          style={{
            borderRadius: "18px",
            padding: "14px",
            backgroundColor:
              activeId === restaurant.id ? "#FFF6EA" : "#FFFFFF",
            boxShadow:
              activeId === restaurant.id
                ? "0 18px 32px rgba(230, 138, 46, 0.18)"
                : "0 12px 22px rgba(74, 59, 50, 0.1)",
          }}
        >
          <img
            src={restaurant.imageURL}
            alt={restaurant.name}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold">{restaurant.name}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-[#9A7F6E]">
              <span>⭐ {restaurant.rating}</span>
              <span>{`${restaurant.distanceKm} km`}</span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[#E68A2E]"
                />
                近く
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  </section>
);

export default PopularSpotsList;
