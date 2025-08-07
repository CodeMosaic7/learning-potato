# AI Learning Platform

A modern, AI-powered learning management system built with FastAPI and React, designed to provide personalized educational experiences through intelligent content delivery and assessment.

## 🚀 Features

- **AI-Powered Learning**: Intelligent content recommendations and personalized learning paths
- **User Authentication**: Secure authentication system
- **Interactive Content**: Rich multimedia learning materials and assessments
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **RESTful API**: Comprehensive REST API built with FastAPI
- **Database Integration**: Efficient data management with SQLAlchemy

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.8+** - Core programming language
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation using Python type annotations
- **Authentication** - JWT-based authentication system

### Frontend
- **React** - Frontend JavaScript library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **Modern JavaScript** - ES6+ features

### Development Tools
- **Vite** - Development server and build tool
- **PostCSS** - CSS processing
- **ESLint/Prettier** - Code formatting and linting

## 📋 Prerequisites

Before running this application, make sure you have:

- **Python 3.8+** installed
- **Node.js 16+** and npm/yarn installed
- **Git** for version control

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd learning-platform
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd ai-learning-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if applicable)
python -m alembic upgrade head

# Start the FastAPI server
python main.py
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ai-learning-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
learning-platform/
├── ai-learning-backend/
│   ├── app/
│   │   ├── __pycache__/
│   │   ├── authentication/
│   │   ├── router/
│   │   └── services/
│   ├── crud.py
│   ├── db.py
│   ├── dependencies.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── test.py
├── ai-learning-frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── auth_app.db
├── notes.txt
└── requirements.txt
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./auth_app.db

# JWT Settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/ML Settings
AI_MODEL_ENDPOINT=your-ai-endpoint
AI_API_KEY=your-ai-api-key

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5173
```

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Learning Content
- `GET /courses` - Get all courses
- `GET /courses/{id}` - Get specific course
- `POST /courses` - Create new course
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course

### AI Features
- `POST /ai/recommendations` - Get personalized recommendations
- `POST /ai/assessment` - AI-powered assessment
- `GET /ai/progress` - Get learning analytics

## 🧪 Testing

### Backend Tests
```bash
cd ai-learning-backend
python -m pytest test.py -v
```

### Frontend Tests
```bash
cd ai-learning-frontend
npm run test
```

## 🚢 Deployment

### Backend Deployment
1. Install production dependencies
2. Set environment variables
3. Run database migrations
4. Start with a production ASGI server:

```bash
pip install uvicorn[standard]
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## 📊 Database Schema

The platform uses SQLAlchemy models for:
- **Users**: User accounts and profiles
- **Assessments**: Quizzes and evaluations


## 🤖 AI Integration

The platform includes AI-powered features:
- **Personalized Recommendations**: Content suggestions based on learning patterns
- **Adaptive Assessment**: Dynamic difficulty adjustment
- **Learning Analytics**: Progress insights and performance prediction
- **Content Generation**: AI-assisted content creation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention
- Rate limiting (configurable)

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🔄 Changelog

### Version 1.0.0
- Initial release with core learning platform features
- AI-powered recommendations
- User authentication and authorization
- Course management system
- Progress tracking and analytics

## 🙏 Acknowledgments

- FastAPI community for excellent documentation
- React and Vite teams for modern development tools
- Open source contributors and maintainers

---

Built with ❤️ using FastAPI and React
