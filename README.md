# Marvel Duel - Card Database Website

ฐานข้อมูลการ์ด Marvel Duel สร้างด้วย **React + TypeScript** + Node.js + MongoDB + Tailwind CSS

## 🚀 Features

- 🔍 **ค้นหาการ์ด** — ค้นหาด้วยชื่อภาษาไทย/อังกฤษ, คำอธิบาย
- 🏷️ **กรอง Faction** — กรองตาม Avengers, X-Men, Guardians,Asgardian และอื่น ๆ
- 💎 **กรอง Cost / Rarity / Type** — ค้นหาการ์ดตามต้นทุน ความหายาก และประเภท
- 🃏 **Deck Builder** — สร้าง, บันทึก และจัดการเดคการ์ด
- 📊 **Meta Decks** — เดคแนะนำพร้อม Tier List และอัตราการชนะ
- 📱 **Responsive** — รองรับทุกขนาดหน้าจอ
- 🔷 **TypeScript** — Type-safe frontend with full IntelliSense support

## 🛠️ Tech Stack

- **Frontend**: React 18 + **TypeScript** + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express.js (JavaScript)
- **Database**: MongoDB + Mongoose
- **UI Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
git clone <repo>
cd Marvel-Duel
npm run install:all
```

### 2. Configure Environment
แก้ไข `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marvel-duel
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Development
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📂 Project Structure

```
Marvel-Duel/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Navbar, CardItem, CardFilter, CardModal
│   │   ├── pages/       # HomePage, CardsPage, DeckBuilderPage, MetaDecksPage
│   │   └── services/    # API calls
│   └── ...
└── server/              # Express backend
    └── src/
        ├── models/      # Card, Deck, MetaDeck
        ├── routes/      # /api/cards, /api/decks, /api/meta-decks
        └── seed.js      # Sample data
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | ดึงการ์ดทั้งหมด (search, filter, paginate) |
| GET | `/api/cards/:id` | ดึงการ์ดตาม ID |
| GET | `/api/cards/factions` | ดึง Faction ทั้งหมด |
| GET | `/api/decks` | ดึงเดคทั้งหมด |
| POST | `/api/decks` | บันทึกเดค |
| PUT | `/api/decks/:id` | อัปเดตเดค |
| DELETE | `/api/decks/:id` | ลบเดค |
| GET | `/api/meta-decks` | ดึง Meta Decks |
