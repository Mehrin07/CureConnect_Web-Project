# CureConnect — Hospital Management System

Full-stack project: React (frontend) + Node.js/Express (backend) + MongoDB (database).

## Folder structure
```
cureconnect/
  backend/      -> Express API + MongoDB models
  frontend/     -> React (Vite) app
```

## Backend setup
```
cd backend
npm install
cp .env.example .env      # then edit .env with your real MongoDB URI + JWT secret
npm run dev                # or: npm start
```
Runs at http://localhost:5000

## Frontend setup
```
cd frontend
npm install
npm run dev
```
Runs at http://localhost:3000

