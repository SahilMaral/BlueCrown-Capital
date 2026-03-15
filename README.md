# 💎 BlueCrown Capital — Elite Financial Suite

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-success?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> A premium, highly scalable, and secure full-stack MERN application representing a modern financial portal. Built with an "Elite" design aesthetic and atomic architecture.

---

## ✨ Key Features

- **🔐 Secure Authentication** — JWT-based login/register with secure HTTP-only cookie potential and role-based guards.
- **📊 Live Analytics** — Interactive transaction history charts (Recharts) visualizing cash-flow trends.
- **💼 Entity Management** — Manage Companies, Banks, Ledgers, and Clients with a unified "Elite" UI.
- **🧾 Transaction Engine** — Atomic processing of Receipts and Payments with automatic balance updates.
- **📁 Modular Design** — Strict MVC separation in Backend; Redux Toolkit & Custom Hooks in Frontend.
- **⚖️ Scalability** — Designed for high-performance with asynchronous processing and atomic database transactions.

---

## 🚀 Tech Stack

### **Frontend** (Vite + React)
* **Logic:** React 18 (Functional Components, Hooks)
* **State:** Redux Toolkit (@reduxjs/toolkit)
* **Charts:** Recharts (Visual Analytics)
* **UI:** Vanilla CSS with Elite Tokens & Glassmorphism
* **Routing:** React Router v6

### **Backend** (Node + Express)
* **Core:** Node.js, Express.js
* **Database:** MongoDB + Mongoose (ODM)
* **Security:** Helmet, CORS, Rate Limiting, bcryptjs
* **Validation:** Joi (Schema Validation)
* **Architecture:** Controller-Service-Model Pattern

---

## 📂 Project Structure

```text
BlueCrown-Capital/
├── 🌐 frontend/          # Vite + React app
│   ├── 🧩 components/    # Atomic UI components & Icons
│   ├── 📦 store/         # Redux slices & configuration
│   └── 📄 pages/         # Feature-rich route pages
├── ⚙️ backend/           # Express.js API
│   ├── 🎮 controllers/   # Request/Response handlers
│   ├── 🛠️ services/      # Business logic (Atomic operations)
│   └── 📁 models/        # Mongoose Schemas (Collection definitions)
├── 📜 docs/              # Technical documentation
└── 🐳 docker/            # Containerization files
```

---

## 🛠️ Installation & Setup

### **1. Prerequisites**
* Node.js (v18+)
* MongoDB (Local or Atlas)

### **2. Backend Configuration**
```bash
cd backend
npm install
```
Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bluecrown_db
JWT_SECRET=your_elite_secret_key
JWT_EXPIRE=30d
```
Run development server:
```bash
npm run dev
```

### **3. Frontend Configuration**
```bash
cd frontend
npm install
```
Run development server:
```bash
npm run dev
```

---

## 🛡️ API Endpoints Preview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Secure login session |
| `GET` | `/api/v1/reports/dashboard-stats` | Real-time portfolio summary |
| `GET` | `/api/v1/reports/transaction-history` | 30-day analytics data |

---

## 🤝 Contribution

1. **Fork** the repository
2. **Branch**: `git checkout -b feature/AmazingFeature`
3. **Commit**: `git commit -m 'feat: Add some AmazingFeature'`
4. **Push**: `git push origin feature/AmazingFeature`
5. **Open a PR**

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with ❤️ by the BlueCrown Team*
