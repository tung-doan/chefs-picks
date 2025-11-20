# CHEFS-PICKS
GỢI Ý BỮA ĂN PHÙ HỢP

## 🛠 Công Nghệ Sử Dụng

* **Frontend:** ReactJS (Vite), CSS
* **Backend:** Node.js, Express, MongoDB, Mongoose

---

## ⚙️ Yêu Cầu (Prerequisites)
* Node.js (v14+)
* MongoDB (đã cài đặt hoặc dùng Atlas Cloud)
* Git

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

Để chạy dự án, bạn cần cài đặt thư viện cho cả Root, Client và Server. Hãy chạy lần lượt các lệnh sau tại terminal:

### 1. Cài đặt thư viện gốc
Tại thư mục gốc của dự án:
```bash
npm install
```

### 2. Cài đặt thư viện cho Server (Backend)

```bash
cd server
npm install
```

### 3. Cài đặt thư viện cho Client (Frontend)

```bash
cd client
npm install
```

*(Sau khi xong, quay lại thư mục gốc: `cd ..`)*

---

## 🔑 Cấu Hình Biến Môi Trường (.env)

Bạn cần tạo file `.env` trong thư mục **`server/`** để cấu hình:

1. Vào thư mục `server`.
2. Tạo file `.env`.
3. Thêm nội dung sau (sửa lại cho phù hợp):

```env
PORT=5000
DB_URL=mongodb://localhost:27017/chefs_picks
# Hoặc nếu dùng MongoDB Atlas:
# DB_URL=mongodb+srv://<user>:<pass>@cluster...
```

---

## ▶️ Cách Chạy Dự Án

Sau khi cài đặt xong, đứng tại **thư mục gốc** và chạy lệnh:

```bash
npm run dev
```

Lệnh này sẽ tự động mở:

* **Server:** http://localhost:5000
* **Client:** http://localhost:5173 (hoặc cổng Vite cấp)

### Hoặc chạy riêng lẻ:

**Chỉ chạy Server:**
```bash
npm run server
```

**Chỉ chạy Client:**
```bash
npm run client
```

---

## 📂 Cấu Trúc Thư Mục

```text
chefs-picks/
├── client/                      # Source code React Frontend
│   ├── public/                  # Static files (images, icons)
│   ├── src/
│   │   ├── assets/              # Assets (images, fonts, etc.)
│   │   ├── components/
│   │   │   ├── common/          # Common/shared components
│   │   │   └── layout/          # Layout components
│   │   ├── config/              # Client configuration
│   │   ├── context/             # React Context API
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── routes/              # Routing configuration
│   │   ├── services/            # API services
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main App component
│   │   ├── App.css              # App styles
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── .env.example             # Environment variables example
│   ├── .gitignore               # Git ignore file
│   ├── eslint.config.js         # ESLint configuration
│   ├── index.html               # HTML template
│   ├── package.json             # Client dependencies
│   ├── README.md                # Client documentation
│   └── vite.config.js           # Vite configuration
│
├── server/                 # Source code Node.js Backend
│   ├── src/
│   │   ├── index.js       # Entry point
│   │   ├── config/        # Database & app config
│   │   ├── controllers/   # Logic xử lý
│   │   ├── middlewares/   # Custom middleware
│   │   ├── models/        # Database Schema (Mongoose)
│   │   ├── routes/        # API Endpoints
│   │   ├── utils/         # Helper functions
│   │   └── docs/          # API documentation
│   ├── .env               # Config (Không up lên git)
│   └── package.json       # Server dependencies
│
├── .vscode/               # VSCode settings
├── node_modules/          # Thư viện chung
├── .gitignore             # File ignore git
├── package.json           # Script chạy tổng
└── README.md              # Hướng dẫn sử dụng
```

---

## 📝 Scripts Có Sẵn

Trong [package.json](package.json) gốc:

* `npm run dev` - Chạy cả client và server cùng lúc
* `npm run client` - Chạy chỉ frontend
* `npm run server` - Chạy chỉ backend

Trong [client/package.json](client/package.json):

* `npm run dev` - Chạy development server với Vite
* `npm run build` - Build production
* `npm run lint` - Kiểm tra code với ESLint
* `npm run preview` - Preview production build

Trong [server/package.json](server/package.json):

* `npm start` - Chạy server với nodemon (auto-reload)

---
