# CEST Dashboard API Backend

Express.js API server for the CEST Dashboard application.

## Features

- RESTful API endpoints for projects and equipment
- Supabase integration for database operations
- Authentication with Supabase Auth
- CORS enabled for frontend integration
- Environment-based configuration
- Error handling and logging

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

## Environment Variables

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:3000
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   └── routes/          # API routes
├── server.js            # Main server file
├── package.json
└── README.md
```