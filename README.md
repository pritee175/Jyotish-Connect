# JyotishConnect · ज्योतिषकनेक्ट

A full-stack astrology consultation platform — built with React + TypeScript + Firebase.
Supports **English** and **Marathi** (मराठी) with a single toggle.

---

## What it does

**For customers:**
- OTP phone login (no password needed)
- Submit queries by selecting domain (career, marriage, health, etc.)
- Enter full birth details for the person (name, DOB, time, place)
- Save family members to reuse details in future queries
- Real-time query status tracking
- Pay via UPI/GPay/PhonePe directly in the app
- View answers, download them, exchange clarification messages

**For your father (astrologer panel):**
- Dashboard with new / urgent / overdue query alerts
- Inbox with filter tabs (New, Fee Set, Paid, Answered)
- Set fee with one tap — quick preset buttons (₹200, ₹300, ₹500, ₹1000)
- Answer with templates — search, insert, personalise in seconds
- Attach remedy snippets (gemstone, puja, mantra, donation, fasting)
- Voice-to-text answers in Hindi/Marathi
- Ask clarification messages before answering
- 48-hour countdown timer starts automatically after payment

---

## Tech Stack

| Layer        | Tool                         |
|-------------|------------------------------|
| Frontend    | React 18 + TypeScript + Vite  |
| Styling     | Tailwind CSS                 |
| Backend     | Firebase (Auth + Firestore)  |
| Auth        | Firebase Phone OTP            |
| Database    | Cloud Firestore (real-time)  |
| Payments    | UPI deeplink + manual confirm|
| Voice       | Web Speech API (built-in)    |
| Hosting     | Vercel (recommended)         |

---

## Setup Guide

### 1. Clone and install

```bash
git clone https://github.com/yourname/jyotish-connect
cd jyotish-connect
npm install
```

### 2. Create Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `jyotish-connect`)
3. Enable **Authentication** → Sign-in method → **Phone**
4. Enable **Firestore Database** → Start in production mode
5. Go to Project Settings → Your Apps → Add Web App
6. Copy the config values

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase config values.

### 4. Set your father's admin UID

1. Run the app once: `npm run dev`
2. Your father logs in with his phone number
3. Go to Firebase Console → Authentication → Users
4. Copy his UID
5. Set `VITE_ADMIN_UID=` in `.env` with that UID
6. Also replace `REPLACE_WITH_FATHERS_UID` in `firestore.rules`

### 5. Set up UPI payment

In `.env`, optionally add:
```
VITE_ADMIN_UPI=yourfather@upi
```
Or edit the `ADMIN_UPI` constant in `src/pages/user/QueryDetailPage.tsx`.

### 6. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore    # select your project
firebase deploy --only firestore:rules
```

### 7. Run locally

```bash
npm run dev
```

### 8. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```
Set the same `.env` variables in Vercel dashboard → Settings → Environment Variables.

---

## Project Structure

```
src/
├── components/
│   └── shared/
│       ├── UI.tsx          # All shared components (Button, Card, Badge, etc.)
│       └── Navbar.tsx      # Navigation with language toggle
├── hooks/
│   ├── useAuth.tsx         # Firebase auth context
│   └── useLang.tsx         # Language context (en/mr)
├── lib/
│   ├── firebase.ts         # Firebase init
│   └── db.ts               # All Firestore operations
├── locales/
│   └── index.ts            # English + Marathi translations
├── pages/
│   ├── LoginPage.tsx       # OTP phone login
│   ├── user/
│   │   ├── UserQueriesPage.tsx    # My Queries list
│   │   ├── AskQueryPage.tsx       # 3-step query submission
│   │   ├── QueryDetailPage.tsx    # Query detail + payment + answer
│   │   └── SavedPersonsPage.tsx   # Address book
│   └── admin/
│       ├── AdminDashboard.tsx     # Stats + urgent alerts
│       ├── AdminInbox.tsx         # Filtered query inbox
│       ├── AdminQueryDetail.tsx   # Answer panel + voice + templates
│       ├── TemplatesPage.tsx      # Template library management
│       └── RemediesPage.tsx       # Remedy library management
├── types/
│   └── index.ts            # All TypeScript types
├── AppRouter.tsx           # Route definitions + guards
├── App.tsx                 # Root with providers
└── main.tsx                # Entry point
```

---

## Firestore Collections

| Collection        | Description                          |
|------------------|--------------------------------------|
| `users/{uid}`    | User profile (name, phone, lang)     |
| `users/{uid}/savedPersons` | Address book per user       |
| `queries/{id}`   | All consultation queries             |
| `templates/{id}` | Answer templates (admin manages)     |
| `remedies/{id}`  | Remedy library (admin manages)       |

---

## Adding Seed Templates (Recommended)

After setup, go to Admin → Templates and add common ones like:

- **Marriage Delay (General)** — standard answer for marriage timing queries
- **Career Change (Career)** — suitable time analysis for job change
- **Health Issues (Health)** — general health remedy recommendations
- **Foreign Travel (Travel)** — yogas for foreign settlement

Tag them well (e.g. `saturn, delay, shani, शनि`) so they show up in search.

---

## Mobile App (Phase 2)

To convert to a mobile app, wrap this in a **Capacitor** or **React Native WebView** shell.
The PWA already works on mobile browsers — users can "Add to Home Screen".

---

## License

MIT — build freely.
