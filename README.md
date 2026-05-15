# 🚚 Hasset Delivery — Frontend Application

> **React + TypeScript frontend** for a full delivery management platform — real-time order tracking on a live map, Chapa payment flow, role-based dashboards, and WebSocket-powered driver ↔ customer communication.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/Tailwind CSS-3.x-38B2AC?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP.js-purple?style=flat-square" />
  <img src="https://img.shields.io/badge/Maps-Leaflet-199900?style=flat-square&logo=leaflet" />
</p>

> **Backend repo:** [Delivery Management System API](https://github.com/Yobil-Job/delivery) — Spring Boot · WebSocket · Chapa · Redis

---

## What This Application Does

Three roles. Three focused dashboards. One real-time platform.

| Role | What They See |
|------|--------------|
| 👤 **Customer** | Place orders, pay via Chapa, watch live driver location on map, chat with driver |
| 🚗 **Driver** | View assigned deliveries, update status, upload delivery proof, track earnings |
| 🛡️ **Admin** | Full system control — users, orders, pricing, analytics, live map of all active deliveries |

---

## Key Features

### 🗺️ Real-Time Order Tracking
Live map (Leaflet) with WebSocket/STOMP — driver location updates the moment the driver moves. Customers watch their order arrive in real time without refreshing.

### 💳 Chapa Payment Flow
Full payment lifecycle integrated into the UI — initialize → redirect → return with status. Matches the backend webhook flow for a seamless checkout experience.

### 💬 Live Customer ↔ Driver Chat
In-app messaging via WebSocket. No external service. Messages delivered instantly between the customer and their assigned driver.

### 📊 Role-Specific Dashboards
Each role lands on a completely different dashboard built for their workflow. Admin gets analytics + Recharts visualizations. Driver gets earnings + delivery queue. Customer gets order history + spend analytics.

### 🌗 Dark / Light Mode
System-aware theme with manual toggle. Persisted across sessions.

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18.3.1 |
| Language | TypeScript |
| Build Tool | Vite 6.3.5 |
| Styling | Tailwind CSS |
| UI Components | Radix UI |
| Routing | React Router DOM |
| State | React Context API |
| HTTP | Axios (with interceptors) |
| WebSocket | SockJS + STOMP.js |
| Maps | Leaflet + React Leaflet |
| Charts | Recharts |
| Forms | React Hook Form |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Date Handling | date-fns |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- [Delivery backend](https://github.com/Yobil-Job/delivery) running on `:8080`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Yobil-Job/Hasset_Delivery_Front-End_Side.git
cd Hasset_Delivery_Front-End_Side

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# 4. Start the dev server
npm run dev
```

App available at: `http://localhost:5173`

### Environment Variables

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Hasset Delivery
VITE_APP_VERSION=1.0.0
```

---

## Scripts

```bash
npm run dev        # Start dev server with HMR
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

---

## Project Structure

```
src/
├── components/
│   ├── admin/        # Admin-specific components
│   ├── auth/         # Login, register, email verify, password reset
│   ├── driver/       # Driver dashboard components
│   ├── order/        # Order creation, tracking, history
│   ├── global/       # Navbar, layout, notifications
│   └── ui/           # Reusable design system components
├── pages/
│   ├── admin/        # Admin page views
│   └── driver/       # Driver page views
├── contexts/         # Auth, theme, WebSocket context providers
├── hooks/            # Custom hooks (useAuth, useWebSocket, useOrders…)
├── services/         # Axios API service layer (one file per domain)
├── types/            # TypeScript interfaces and enums
└── utils/            # Helpers, formatters, validators
```

---

## Security

| Concern | Implementation |
|---------|---------------|
| Auth | JWT stored securely, auto-attached to every request via Axios interceptor |
| Token refresh | Automatic silent refresh before expiry |
| Logout | Token blacklisted on backend (Redis), cleared client-side |
| Input | Client-side validation on all forms via React Hook Form |
| XSS | Input sanitization + no `dangerouslySetInnerHTML` |
| Redirects | Safe redirect URL validation before navigation |
| API errors | Global response interceptor — auth errors redirect to login |

---

## Deployment

The app builds to a static `dist/` folder — deploy anywhere:

```bash
npm run build
```

**Vercel (recommended — zero config):**
```bash
npx vercel
```

**Netlify:**
```bash
npx netlify deploy --prod --dir=dist
```

Set `VITE_API_URL` to your production backend URL in the platform's environment variable settings.

**Production checklist:**
- [ ] `VITE_API_URL` points to production backend
- [ ] HTTPS enabled
- [ ] CORS on backend allows production frontend domain
- [ ] WebSocket URL updated if different from API URL

---

## Common Issues

| Issue | Fix |
|-------|-----|
| App won't start | Delete `node_modules` + `package-lock.json` → `npm install` |
| API requests fail | Check `VITE_API_URL` in `.env` and confirm backend is running |
| Map not loading | Check Leaflet CSS is imported in `main.tsx` |
| WebSocket drops | Verify backend WebSocket URL and check CORS config |
| Build fails | Run `npx tsc --noEmit` to find TypeScript errors first |
| Styling broken | Clear browser cache + verify Tailwind config |

---

## Related

- 🔗 **[Backend API](https://github.com/Yobil-Job/delivery)** — Spring Boot, WebSocket, Chapa, Redis, PostgreSQL

---

## Author

**Eyob Weldetensay**
Full-Stack Developer · Spring Boot · React · TypeScript · Real-time Systems

[![GitHub](https://img.shields.io/badge/GitHub-Yobil--Job-181717?style=flat-square&logo=github)](https://github.com/Yobil-Job)

---

*Built with React 18 · TypeScript · Vite · Tailwind CSS · Leaflet · WebSocket*
