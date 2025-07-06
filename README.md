# Smart Task Manager 🚀

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![JWT Auth](https://img.shields.io/badge/Auth-JWT-brightgreen)

A productivity application for managing tasks with deadlines, categories, and real-time notifications.

## Features ✨

- **User Authentication** (Register/Login/Profile)
- **Task Management** (CRUD operations)
- **Categories Organization** (Work/Personal/Learning)
- **Due Date Reminders**
- **Priority Levels** (Low/Medium/High)
- **Task Status Tracking** (Pending/In Progress/Completed)

## Tech Stack 💻

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt Password Hashing

**Frontend:**
- React.js
- Redux Toolkit
- Material-UI
- Axios

## Installation 🛠️

### Backend Setup
```bash
cd backend
npm install
Create .env file:

env
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_strong_secret
JWT_EXPIRE=30d
PORT=5000
Start server:

bash
npm run dev
Frontend Setup
bash
cd frontend
npm install
npm start
API Endpoints 📡
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/tasks	Get all tasks
POST	/api/tasks	Create new task
PUT	/api/tasks/:id	Update task
DELETE	/api/tasks/:id	Delete task
PATCH	/api/tasks/:id/complete	Mark task as complete
Project Structure 📂
text
backend/
├── controllers/   # Business logic
├── models/        # MongoDB schemas
├── routes/        # API endpoints
├── middleware/    # Auth middleware
└── server.js      # Entry point

frontend/
├── public/        # Static assets
└── src/
    ├── components/ # UI components
    ├── pages/      # Application views
    ├── store/      # Redux configuration
    └── App.js      # Root component
Environment Variables 🔧
Variable	Description	Example
MONGO_URI	MongoDB connection string	mongodb://localhost:27017/taskmanager
JWT_SECRET	Secret for JWT tokens	your_strong_secret
JWT_EXPIRE	Token expiration	30d

License 📄
MIT License - see LICENSE for details.

Built with ❤️ by Faheem
