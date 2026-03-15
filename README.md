# BlueCrown Capital

A modern, highly scalable, and secure full-stack MERN application representing a financial or enterprise portal. Built iteratively with industry best practices for the frontend and backend, adhering to a strict MVC architecture.

## Features
- **User Authentication:** Complete JWT-based authentication system (Login, Register).
- **Role-Based Access Control:** Secure endpoints and routes using middleware guards (Admin & User).
- **Scalable Architecture:** Controllers, Services, Middlewares, and Models separated distinctly in the Backend. Redux Toolkit, custom Hooks, and atomic UI structures in the Frontend.
- **Security First:** Rate-limiting, Helmet for HTTP headers, CORS, JWT standard implementation, and Joi validation.
- **RESTful API:** Structured and versioned endpoints (`/api/v1/...`).
- **Global Error Handling:** Centralized custom error classes and wrapper middleware to catch exceptions across the stack.

## Tech Stack
### Backend
- **Node.js** & **Express.js** 
- **MongoDB** with **Mongoose**
- **Security:** `bcryptjs`, `jsonwebtoken`, `helmet`, `cors`, `express-rate-limit`
- **Validation:** `joi`
- **Logging:** `morgan`

### Frontend
- **React 18** (Functional Components + Hooks)
- **Vite** as a modern build tool
- **State Management:** `@reduxjs/toolkit`, `react-redux`
- **Routing:** `react-router-dom` v6
- **HTTP Client:** `axios` (with configured interceptors)
- **Styling:** CSS-in-JS or global styles (Framework adaptable, configured with Tailwind/CSS Modules implicitly)

## Project Architecture

The repository enforces a strict separation of concerns, housing `frontend` and `backend` as independent deployable layers inside a monorepo structure.

### Folder Structure
```
BlueCrown-Capital/
├── backend/
│   ├── src/
│   │   ├── config/        # Database and environment configurations
│   │   ├── controllers/   # Route handlers coordinating models & services
│   │   ├── middlewares/   # Custom Express middlewares (auth, errors, validation)
│   │   ├── models/        # Mongoose data schemas
│   │   ├── routes/        # API route declarations (v1)
│   │   ├── services/      # Core business logic
│   │   ├── utils/         # Helper functions, custom errors, response formatting
│   │   ├── validators/    # Joi schema definitions
│   │   ├── app.js         # Express app instantiation and configuration
│   │   └── server.js      # Entry point and HTTP listener
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable standalone UI elements
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Main, Auth, and Dashboard wrapper layouts
│   │   ├── pages/         # Top-level page components mapping to routes
│   │   ├── routes/        # AppRoutes definitions and Route guards
│   │   ├── services/      # Axios API instances and request methods
│   │   ├── store/         # Redux Toolkit configuration and slices
│   │   ├── utils/         # Formatting and helper utilities
│   │   ├── App.jsx        # Root component wrapper
│   │   └── main.jsx       # React DOM target
│   └── package.json
├── docs/                  # API, architecture, and project documentation
├── docker/                # Optional Docker compose and build configurations
└── README.md
```

## Installation Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd BlueCrown-Capital
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory based on the `.env.example` template:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/bluecrown_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Running Backend (Development)
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Running Frontend (Development)
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible via Vite's default dev port (usually `http://localhost:5173`).

## API Documentation
The current foundational routing includes authentication endpoints. View `backend/src/routes` for further endpoints.

*Note: You can implement Swagger locally inside `/docs` or configure `swagger-ui-express`.*

### `POST /api/v1/auth/register`
- **Body:** `{ name, email, password }`
### `POST /api/v1/auth/login`
- **Body:** `{ email, password }`
### `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`

## Deployment Guide
Both layers are built for stateless deployment.
- **Backend:** Can be deployed using Docker, Heroku, Render, AWS Elastic Beanstalk, or DigitalOcean Apps. Ensure environment variables are secured.
- **Frontend:** Executing `npm run build` generates static files within `/dist`. These can be hosted on Vercel, Netlify, or an S3 bucket.

## Contribution Guidelines
1. Fork the repo and create your feature branch (`git checkout -b feature/AmazingFeature`).
2. Commit your changes strictly following conventional commits (`git commit -m 'feat: Add some AmazingFeature'`).
3. Ensure the project is formatted (use Prettier).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License
Distributed under the MIT License. See `LICENSE` for more information.
