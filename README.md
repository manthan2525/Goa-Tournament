# 🏆 Goa Tournament - Multi-Sport Tournament Management Platform

> **MCA Capstone Project**  
> A full-stack, real-time sports tournament management system designed for Goa's athletic community across Panaji, Mapusa, Margao, and Vasco stadiums.

---

## 🌟 Key Features

1. **Authentication & Security**:
   - JWT tokens stored in **HTTP-only secure cookies**.
   - Password encryption via `bcryptjs` (salt rounds >= 10).
   - Role-based Route Protection (`PLAYER`, `ORGANIZER`, and unauthenticated `SPECTATOR`).

2. **Smart Tournament Engine & Fixture Generator**:
   - **Knockout Bracket Generator**: Single elimination tournament trees with bye handling & seed pairings.
   - **Round Robin Engine**: League match schedule generator.
   - **Group + Knockout Stage**: Multi-group matches with semi-final/final automatic qualification.
   - **Multi-Sport Support**: Football, Cricket, Badminton, Chess, Kabaddi, Table Tennis, Volleyball, Futsal.

3. **QR Payment & Manual Verification Flow**:
   - Organizers create tournaments with custom registration fees, UPI ID, and QR code proof.
   - Players register squads, scan the UPI QR code in-app, pay externally via any UPI app (GPay/PhonePe/Paytm), upload transaction screenshot, and provide 12-digit UTR ID.
   - Organizer Payment Dashboard displays uploaded receipts with **1-Click Accept** or **Reject with Mandatory Reason**.
   - Instant badge updates: `PENDING` (Yellow), `VERIFIED` (Green), `REJECTED` (Red).

4. **Real-time Live Scores & Standings (Socket.IO)**:
   - Organizers adjust live match scores through the **Live Scorepad Control Panel**.
   - Socket.IO broadcasts `score_changed` and `match_update` events instantly to all connected Spectators and Players without page reloads.
   - Dynamic auto-advancement of winners to next bracket round upon match status reaching `COMPLETED`.
   - Automated Points Table computation (Matches, Won, Drawn, Lost, GD, Points, Form).

5. **Goa Venue & Tournament Discovery**:
   - Location filtering by major Goa sports grounds: Tilak Maidan (Vasco), Campal Indoor Complex (Panaji), Peddem Sports Complex (Mapusa), Fatorda Multipurpose (Margao), etc.

---

## 🏗️ Architecture & Project Structure

```
goa-tournament/
├── server/                      # Node.js + Express + Socket.IO Backend
│   ├── config/                  # MongoDB & Cloudinary configuration
│   ├── controllers/             # Auth, Tournament, Registration, Payment, Match
│   ├── middleware/              # Cookie JWT Auth, Role Guard, Multer Memory Storage, Error Handler
│   ├── models/                  # Mongoose Schemas (User, Tournament, Registration, Payment, Match, Standings)
│   ├── routes/                  # Express REST API routes
│   ├── sockets/                 # Socket.IO real-time broadcaster
│   ├── utils/                   # Fixture generator algorithm & DB seed
│   ├── server.js                # Server entry point
│   └── package.json
├── client/                      # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/          # Navbar, FixtureBracket, StandingsTable, Modals, Cards
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── pages/               # Home, Tournaments, TournamentDetail, LiveCenter, Dashboards, Auth
│   │   ├── services/            # Axios API & Socket.IO client
│   │   ├── utils/               # Goa constants, sports list, status badges
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Local MongoDB (or automated in-memory MongoDB fallback will launch automatically)

### 1. Run the Backend API & WebSocket Server
```bash
cd server
npm install
node server.js
```
The server will start on `http://localhost:5000` and auto-seed rich demo data if database is empty.

### 2. Run the React Frontend Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Organizer (Host)** | `organizer@gfa.com` | `password123` | Host tournaments, verify UPI payments, update live scorepad |
| **Player (Captain)** | `player@goa.com` | `password123` | Register team roster, scan UPI QR, upload payment receipt |

*(You can also use the 1-Click Demo Login buttons directly on the Sign-In screen!)*

---

## 📡 REST API & WebSocket Reference

### Authentication
- `POST /api/auth/register` - Create Player/Organizer account
- `POST /api/auth/login` - Authenticate & set HTTP-only cookie
- `GET /api/auth/me` - Get current session
- `POST /api/auth/logout` - Clear auth cookie

### Tournaments
- `GET /api/tournaments` - Search & filter tournaments by sport, Goa location, fee
- `GET /api/tournaments/:id` - Tournament details, verified squads, bracket info
- `POST /api/tournaments` - Create tournament with UPI ID & QR code (Organizer)
- `POST /api/tournaments/:id/start` - Auto-generate tournament fixtures and start event (Organizer)
- `GET /api/tournaments/organizer/my-tournaments` - Organizer dashboard analytics

### Registrations & Payments
- `POST /api/registrations` - Register team & roster for tournament
- `GET /api/registrations/my-registrations` - Player's registered teams
- `POST /api/payments` - Submit UPI transaction ID & screenshot
- `GET /api/payments/tournament/:id` - Organizer review dashboard
- `PUT /api/payments/:id/verify` - Accept & confirm team entry
- `PUT /api/payments/:id/reject` - Reject with mandatory reason

### Live Scoring (Socket.IO)
- `GET /api/matches/live` - All live matches across Goa
- `GET /api/matches/tournament/:id` - Fixtures & standings for a tournament
- `PUT /api/matches/:id/score` - Organizer updates scorepad & broadcasts WebSocket event
- **Socket Events**: `join_tournament`, `match_update`, `score_changed`, `global_live_score`
