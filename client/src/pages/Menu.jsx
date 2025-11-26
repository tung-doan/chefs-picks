import React, { useState } from 'react';
import { Search, Heart, Home } from 'lucide-react';

const menuItems = [
  {
    id: 1,
    name: 'Butter Chicken Curry',
    category: 'Curry',
    price: 780,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Pork Cutlet Set',
    category: 'Set Meal',
    price: 980,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Miso Ramen',
    category: 'Ramen',
    price: 820,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Shoyu Ramen',
    category: 'Ramen',
    price: 750,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Beef Bowl',
    category: 'Rice Bowl',
    price: 680,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Chicken & Egg Bowl',
    category: 'Rice Bowl',
    price: 760,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop'
  },
  {
    id: 7,
    name: 'Green Curry',
    category: 'Curry',
    price: 890,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    name: 'Salad Bowl',
    category: 'Salad',
    price: 620,
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  },
  {
    id: 9,
    name: 'Tofu Salad',
    category: 'Salad',
    price: 580,
    rating: 3.9,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  }
];

function Menu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = !cuisine || item.category === cuisine;
    return matchesSearch && matchesCuisine;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-orange-500 mb-4">
            <Home size={20} />
            <span className="font-medium">Home</span>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu (e.g., curry, ramen, salad)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Cuisine</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Price range</option>
              <option value="low">Under ¥700</option>
              <option value="mid">¥700 - ¥850</option>
              <option value="high">Over ¥850</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="popular">Most popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setCuisine('');
                setPriceRange('');
                setSortBy('popular');
              }}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded mt-1">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Heart
                      size={20}
                      className={favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>Rating:</span>
                    <span className="text-yellow-500">★★★★</span>
                    <span>({item.rating})</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">¥{item.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No items found matching your criteria
          </div>
        )}
      </main>
    </div>
  );
}

export default Menu;