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

## Seeding sample data (optional, for demo)
Use MongoDB Compass or `mongosh` to insert a few documents into the
`bloodbanks` and `beds` collections so the Home/Blood Bank pages show data, e.g.:
```js
db.bloodbanks.insertMany([
  { bloodGroup: "A+", unitsAvailable: 24 },
  { bloodGroup: "O-", unitsAvailable: 3 },
]);
db.beds.insertMany([
  { department: "General Ward", totalBeds: 40, occupiedBeds: 22 },
  { department: "ICU", totalBeds: 10, occupiedBeds: 7 },
]);
```

See the full week-by-week guide in the chat conversation for detailed explanations.
