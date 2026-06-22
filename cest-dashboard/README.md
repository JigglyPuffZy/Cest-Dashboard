# CEST 2.0 Dashboard

A modern, professional dashboard for the Department of Science and Technology (DOST) Community Empowerment through Science & Technology (CEST 2.0) program.

## Features

- **Modern UI Design**: Clean, professional interface with dark/light mode
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Data**: Track projects, communities, budgets, and equipment
- **Interactive Charts**: Visualize data with bar charts, pie charts, and analytics
- **Advanced Filtering**: Search and filter projects by year, status, and more
- **Dark Mode**: Eye-friendly dark theme with smooth transitions
- **Professional Icons**: Lucide React icons for a polished look

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Lucide React** - Beautiful & consistent icon set

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   └── pages/           # Page components
│       └── Dashboard.jsx
├── hooks/               # Custom React hooks
│   ├── usePersistedState.js
│   └── useToast.js
├── utils/               # Utility functions
│   └── helpers.js
├── constants/           # App constants
│   └── index.js
├── assets/              # Images and static files
├── App.jsx              # Main app component
└── main.jsx             # App entry point
```

## Features Overview

### Dashboard
- Overview tab with key metrics and statistics
- Projects tab with search and filtering
- Analytics tab with charts and component breakdown
- Recent projects list
- Status distribution (Ongoing, Finished, Liquidated)

### Dark Mode
- Toggle between light and dark themes
- Persistent user preference
- Smooth transitions
- Optimized for readability

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized layouts for all screen sizes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow Tailwind CSS utility-first approach
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic

## License

© 2026 Department of Science and Technology (DOST)

## Support

For support and questions, please contact the DOST CEST 2.0 team.
