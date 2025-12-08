# Favorites API Documentation

API quản lý món ăn yêu thích của người dùng.

## Base URL

```
http://localhost:5000/api/favorites
```

## Authentication

Tất cả endpoints đều yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Thêm món yêu thích

**Endpoint:** `POST /api/favorites`

**Mô tả:** Thêm một món ăn vào danh sách yêu thích của user.

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "dishId": "69367f37e5a508bc76949bbf"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Đã thêm vào yêu thích",
  "data": {
    "_id": "693689577ea670a8704bed7b",
    "userId": "693689577ea670a8704bed7b",
    "dishId": "69367f37e5a508bc76949bbf",
    "createdAt": "2024-12-05T10:30:00.000Z",
    "updatedAt": "2024-12-05T10:30:00.000Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "dishId là bắt buộc"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Món ăn không tồn tại"
}
```

**Response Error (409):**

```json
{
  "success": false,
  "message": "Món ăn đã có trong danh sách yêu thích"
}
```

---

### 2. Xóa món yêu thích

**Endpoint:** `DELETE /api/favorites/:dishId`

**Mô tả:** Xóa một món ăn khỏi danh sách yêu thích.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `dishId` (required): ID của món ăn cần xóa

**Example:**

```
DELETE /api/favorites/69367f37e5a508bc76949bbf
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Đã xóa khỏi yêu thích"
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Không tìm thấy món yêu thích"
}
```

---

### 3. Lấy danh sách yêu thích

**Endpoint:** `GET /api/favorites`

**Mô tả:** Lấy danh sách các món ăn yêu thích của user với pagination và filters.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 20): Số items mỗi trang
- `category` (optional): Lọc theo tên category
- `sortBy` (optional, default: "createdAt"): Sắp xếp theo (createdAt, name, price, rating)
- `sortOrder` (optional, default: "desc"): Thứ tự sắp xếp (asc, desc)
- `search` (optional): Tìm kiếm theo tên hoặc mô tả

**Example:**

```
GET /api/favorites?page=1&limit=10&category=Curry&sortBy=price&sortOrder=asc&search=chicken
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "_id": "693689577ea670a8704bed7b",
        "userId": "693689577ea670a8704bed7b",
        "dishId": "69367f37e5a508bc76949bbf",
        "createdAt": "2024-12-05T10:30:00.000Z",
        "updatedAt": "2024-12-05T10:30:00.000Z",
        "dish": {
          "_id": "69367f37e5a508bc76949bbf",
          "name": "Butter Chicken Curry",
          "categoryId": "693689587ea670a8704bed8a",
          "price": 780,
          "rating": 4.6,
          "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
          "description": "Rich and creamy butter chicken curry",
          "isAvailable": true,
          "favoriteCount": 5
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 4. Kiểm tra món ăn có trong yêu thích không

**Endpoint:** `GET /api/favorites/check/:dishId`

**Mô tả:** Kiểm tra xem một món ăn có trong danh sách yêu thích của user hay không.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `dishId` (required): ID của món ăn cần check

**Example:**

```
GET /api/favorites/check/69367f37e5a508bc76949bbf
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

---

### 5. Kiểm tra nhiều món cùng lúc

**Endpoint:** `POST /api/favorites/check-multiple`

**Mô tả:** Kiểm tra nhiều món ăn cùng lúc xem có trong danh sách yêu thích không. Hữu ích khi hiển thị danh sách món ăn với trạng thái favorite.

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "dishIds": [
    "69367f37e5a508bc76949bbf",
    "69367f37e5a508bc76949bc0",
    "69367f37e5a508bc76949bc1"
  ]
}
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "69367f37e5a508bc76949bbf": true,
    "69367f37e5a508bc76949bc0": false,
    "69367f37e5a508bc76949bc1": true
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "dishIds phải là mảng không rỗng"
}
```

**Use Case:**

```javascript
// Frontend: Hiển thị 20 món ăn với icon tim
const dishIds = menuItems.map((item) => item.id);
const favorites = await checkMultipleFavorites(dishIds);

// Render với favorites status
menuItems.forEach((item) => {
  const isFavorite = favorites[item.id];
  renderHeartIcon(isFavorite); // ❤️ hoặc 🤍
});
```

---

### 6. Thống kê yêu thích

**Endpoint:** `GET /api/favorites/stats`

**Mô tả:** Lấy thống kê về các món yêu thích của user (tổng số, theo category, giá trung bình, v.v.).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "totalFavorites": 10,
    "byCategory": [
      {
        "_id": "Curry",
        "count": 3,
        "avgPrice": 835,
        "avgRating": 4.4,
        "totalSpent": 2505
      },
      {
        "_id": "Ramen",
        "count": 2,
        "avgPrice": 785,
        "avgRating": 4.35,
        "totalSpent": 1570
      },
      {
        "_id": "Rice Bowl",
        "count": 2,
        "avgPrice": 720,
        "avgRating": 4.2,
        "totalSpent": 1440
      },
      {
        "_id": "Salad",
        "count": 2,
        "avgPrice": 600,
        "avgRating": 3.95,
        "totalSpent": 1200
      },
      {
        "_id": "Set Meal",
        "count": 1,
        "avgPrice": 980,
        "avgRating": 4.5,
        "totalSpent": 980
      }
    ]
  }
}
```

**Use Case:**

- Hiển thị dashboard thống kê cho user
- Phân tích sở thích ăn uống
- Tính tổng chi phí cho món yêu thích

---

### 7. Lấy món ăn phổ biến

**Endpoint:** `GET /api/favorites/popular`

**Mô tả:** Lấy danh sách các món ăn được yêu thích nhiều nhất (dựa trên favoriteCount).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional, default: 10): Số lượng món ăn cần lấy

**Example:**

```
GET /api/favorites/popular?limit=5
```

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "69368a1f7ea670a8704bed9a",
      "name": "Pork Cutlet Set",
      "categoryId": {
        "_id": "693689587ea670a8704bed8e",
        "name": "Set Meal"
      },
      "price": 980,
      "rating": 4.5,
      "image": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
      "favoriteCount": 25
    },
    {
      "_id": "69368a1f7ea670a8704bed92",
      "name": "Butter Chicken Curry",
      "categoryId": {
        "_id": "693689587ea670a8704bed8a",
        "name": "Curry"
      },
      "price": 780,
      "rating": 4.6,
      "image": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
      "favoriteCount": 20
    },
    {
      "_id": "69368a1f7ea670a8704bed94",
      "name": "Miso Ramen",
      "categoryId": {
        "_id": "693689587ea670a8704bed8b",
        "name": "Ramen"
      },
      "price": 820,
      "rating": 4.4,
      "image": "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400",
      "favoriteCount": 18
    }
  ]
}
```

**Use Case:**

- Hiển thị "Top Dishes" trên homepage
- Gợi ý món ăn phổ biến cho user mới
- Marketing campaign

---

## Error Responses

### 401 Unauthorized

Khi không có token hoặc token không hợp lệ:

```json
{
  "success": false,
  "message": "Vui lòng đăng nhập"
}
```

Hoặc:

```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Lỗi khi [thao tác]",
  "error": "Chi tiết lỗi (chỉ trong development mode)"
}
```

---

## Data Models

### FavoriteFood Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User"),
  dishId: ObjectId (ref: "Dish"),
  createdAt: Date,
  updatedAt: Date
}
```

### Dish Schema (populated)

```javascript
{
  _id: ObjectId,
  name: String,
  categoryId: ObjectId (ref: "Category"),
  price: Number,
  rating: Number,
  image: String,
  description: String,
  ingredients: [String],
  isAvailable: Boolean,
  favoriteCount: Number,
  restaurantId: ObjectId (ref: "Restaurant"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Business Logic

### Favorite Count Tracking

Khi user thêm/xóa favorite, `favoriteCount` của món ăn tự động tăng/giảm:

```javascript
// Add favorite
await Dish.findByIdAndUpdate(dishId, {
  $inc: { favoriteCount: 1 },
});

// Remove favorite
await Dish.findByIdAndUpdate(dishId, {
  $inc: { favoriteCount: -1 },
});
```

### Duplicate Prevention

Schema có compound index `{ userId: 1, dishId: 1 }` với `unique: true` để ngăn duplicate favorites.

### Indexes

```javascript
// Compound unique index
{ userId: 1, dishId: 1 } - unique

// Query optimization indexes
{ userId: 1, createdAt: -1 }
{ dishId: 1, createdAt: -1 }
```

---
