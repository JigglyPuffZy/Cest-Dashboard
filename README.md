# CEST Dashboard Project

Complete full-stack application for Community Empowerment through Science & Technology (CEST) 2.0 project management.

## 🚀 Features

### Frontend (React Dashboard)
- **Project Management**: Create, view, edit, and archive projects
- **Equipment Tracking**: Link equipment to projects with detailed information
- **Interactive Analytics**: Charts and visualizations for data insights
- **Regional Focus**: Specialized for Region II (Cagayan Valley) provinces
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization with Supabase

### Backend (Express API)
- **RESTful API**: Clean endpoints for all operations
- **Supabase Integration**: Database operations and authentication
- **CORS Enabled**: Frontend-backend communication
- **Error Handling**: Comprehensive error management
- **Environment Configuration**: Flexible deployment options

### Database (Supabase/PostgreSQL)
- **Relational Structure**: Projects, equipment, components, and communities
- **Data Integrity**: Foreign keys and constraints
- **Migration Scripts**: Easy database setup and updates

## 📁 Project Structure

```
cest-project/
├── cest-dashboard/          # React Frontend Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-specific pages
│   │   ├── shared/          # Shared utilities and services
│   │   └── app/             # Main app configuration
│   ├── public/
│   └── package.json
├── backend/                 # Express API Server
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   └── models/          # Data models
│   ├── server.js
│   └── package.json
├── database/                # SQL Scripts and Migrations
│   ├── setup/               # Initial database setup
│   ├── migrations/          # Database migrations
│   └── seeds/               # Sample data
└── docs/                    # Documentation
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/cest-project.git
cd cest-project
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 3. Setup Frontend
```bash
cd cest-dashboard
npm install
npm run dev
```

### 4. Setup Database
- Import SQL scripts from `database/` folder to your Supabase project
- Configure environment variables in both frontend and backend

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
cd cest-dashboard
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables in your hosting platform
# Deploy with your preferred service
```

## 📊 Key Components

### CEST 2.0 Components
- **SEL**: Sustainable Enterprise & Livelihoods
- **HN**: Health & Nutrition
- **HRD**: Human Resource Development
- **DRRM**: Disaster Risk Reduction Management & Climate Change Adaptation
- **BGCET**: Bio-Circular-Green Economy Technologies
- **DG**: Digital Governance

### Regional Coverage
- Batanes
- Cagayan
- Isabela
- Nueva Vizcaya
- Quirino

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Department of Science and Technology (DOST)
- Region II CEST 2.0 Implementation Team
- Supabase for backend infrastructure
- React and Vite for frontend framework