# CEST Project Structure

```
cest-project/
├── frontend/                    # React Dashboard
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── backend/                     # API Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── package.json
│   └── server.js
├── database/                    # SQL Scripts
│   ├── migrations/
│   ├── seeds/
│   └── setup/
├── docs/                       # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
├── .gitignore
├── README.md
└── docker-compose.yml          # Optional: for containerization
```

## Benefits of Monorepo:
- Single repository for entire project
- Easier to manage related changes
- Shared documentation and configuration
- Simplified deployment pipeline