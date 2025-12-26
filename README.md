# Secure Quiz - Personality Assessment Platform

A modern, production-ready personality quiz application built with **React 18**, **Firebase**, and **Vercel Serverless Functions**.

## 🎯 Features

- **10-Question Quiz** - Personality assessment with 8 archetypes
- **Real-Time Admin Dashboard** - Live submission tracking with Firestore
- **Firebase Authentication** - Secure email/password admin login
- **PDF Report Generation** - Download personalized archetype reports
- **CSV Export** - Admin data export for analytics
- **Rate Limiting** - Prevent abuse (3 attempts/hour per IP)
- **Responsive Design** - Mobile, tablet, and desktop support
- **Security First** - Helmet headers, CORS, input validation
- **Serverless Backend** - Vercel Functions for scalability

## 🚀 Quick Start

**New to this project?** Start here: [QUICK_START.md](QUICK_START.md)

### Prerequisites
- Node.js 16+
- Firebase account (free tier)
- Vercel account (free tier)

### 1-Minute Setup

```bash
# 1. Create .env.local in frontend (copy from FIREBASE_SETUP.md)
# 2. Place serviceAccountKey.json in backend/

# Start backend (Terminal 1)
cd backend
vercel dev

# Start frontend (Terminal 2)
cd frontend  
npm run dev
```

Open **http://localhost:5173** and start the quiz!

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | ⚡ **Start here** - 5-minute setup |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | 🔐 Firebase configuration guide |
| [LOCAL_TESTING.md](LOCAL_TESTING.md) | 🧪 Complete development guide |
| [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) | ✅ 100+ test cases |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | 📋 Architecture overview |

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Firebase SDK
- React Router

**Backend:**
- Node.js
- Vercel Serverless Functions
- Firebase Admin SDK
- Helmet + CORS

**Database:**
- Firebase Firestore
- Firebase Authentication

## ✨ What's Ready

- ✅ 10-question personality quiz
- ✅ 8-archetype classification system
- ✅ Real-time admin dashboard with Firestore listeners
- ✅ Firebase authentication integration
- ✅ PDF report generation
- ✅ CSV data export
- ✅ Rate limiting (3 attempts/hour per IP)
- ✅ Responsive design (mobile to desktop)
- ✅ Complete error handling
- ✅ Security headers and CORS
- ✅ Vercel serverless backend
- ✅ Local development environment

## 🎯 Get Started in 3 Steps

### Step 1: Setup Firebase
Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to:
- Create Firebase project
- Download credentials
- Create `.env.local` for frontend

### Step 2: Install & Configure
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Place your Firebase service account key
cp ~/Downloads/serviceAccountKey.json backend/
```

### Step 3: Run Local Servers
```bash
# Terminal 1: Backend on port 3000
cd backend && vercel dev

# Terminal 2: Frontend on port 5173
cd frontend && npm run dev
```

## 📊 Project Structure

```
secure-quiz/
├── frontend/                    # React application
│   ├── src/
│   │   ├── App.jsx             # Main app + routing
│   │   ├── components/Quiz.jsx # Quiz interface
│   │   ├── pages/
│   │   │   ├── Admin.jsx       # Real-time dashboard
│   │   │   ├── AdminLogin.jsx  # Firebase auth
│   │   │   └── Results.jsx     # Results + PDF
│   │   ├── hooks/
│   │   │   ├── useQuiz.js      # Quiz logic
│   │   │   ├── useAuth.js      # Auth context
│   │   │   └── useFirestore.js # Firestore hooks
│   │   └── firebase.js         # SDK init
│   └── .env.example
│
├── backend/                     # Serverless backend
│   ├── api/[[...route]].js     # Main API handler
│   ├── src/firebase.js         # Admin SDK
│   ├── vercel.json
│   └── package.json
│
└── Documentation
    ├── QUICK_START.md
    ├── FIREBASE_SETUP.md
    ├── LOCAL_TESTING.md
    ├── TESTING_CHECKLIST.md
    └── IMPLEMENTATION_SUMMARY.md
```

## 🔑 Key Features

### Quiz System
- 10 personality questions
- 8 unique archetypes
- Weighted scoring algorithm
- Confidence percentage calculation
- IP-based rate limiting

### Admin Dashboard
- Real-time Firestore listeners
- Live submission counter
- Archetype distribution charts
- User search/filter
- CSV export
- User reset functionality

### Security
- Firebase email/password authentication
- Custom JWT tokens for admin
- Rate limiting (3 attempts/hour)
- Helmet security headers
- CORS protection
- Input validation

## 🧪 Testing

```bash
# Follow TESTING_CHECKLIST.md to validate:
# ✅ Quiz flow
# ✅ API endpoints
# ✅ Admin dashboard
# ✅ Rate limiting
# ✅ PDF generation
# ✅ Responsive design
# ✅ Error handling
```

See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for 100+ detailed tests.

## 🚀 Deploy to Production

### Frontend
```bash
cd frontend
vercel --prod
```

### Backend
```bash
cd backend  
vercel --prod
```

Then configure Vercel environment variables with your production Firebase credentials.

## 🐛 Troubleshooting

**Port 3000 in use?**
```bash
lsof -i :3000
kill -9 <PID>
```

**Firebase errors?**
- Check `.env.local` in frontend
- Verify `serviceAccountKey.json` in backend

**API not responding?**
- Ensure `vercel dev` is running on port 3000
- Check `VITE_API_URL` in frontend `.env.local`

See [LOCAL_TESTING.md](LOCAL_TESTING.md) for detailed troubleshooting.

## 📞 Need Help?

1. **Quick setup?** → [QUICK_START.md](QUICK_START.md)
2. **Firebase config?** → [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
3. **Local dev issues?** → [LOCAL_TESTING.md](LOCAL_TESTING.md)
4. **Testing validation?** → [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
5. **Architecture questions?** → [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## 📊 Scoring Algorithm

**8 Archetypes:**
1. Leader - Natural authority & vision
2. Analyst - Logic & data-driven
3. Collaborator - Team player & relationships  
4. Visionary - Innovation & future thinking
5. Achiever - Goals & motivation
6. Scholar - Knowledge & learning
7. Mentor - Teaching & support
8. Creator - Art & originality

Each answer contributes weighted points across archetypes. Result with highest score wins, ties broken deterministically.

## ✅ Status

- **Frontend**: ✅ Complete (React 18, Vite, Tailwind)
- **Backend**: ✅ Complete (Vercel Serverless, Firebase Admin SDK)
- **Database**: ✅ Complete (Firestore collections & rules)
- **Testing**: ✅ Checklist provided (100+ tests)
- **Documentation**: ✅ Complete (5 guides)
- **Ready for**: ✅ Local testing & production deployment

## 🎓 Technologies

- React 18
- Node.js
- Vercel Functions
- Firebase (Firestore, Auth, Storage)
- Tailwind CSS
- Framer Motion
- Recharts
- jsPDF

## 📝 Next Steps

1. ✅ Read [QUICK_START.md](QUICK_START.md)
2. ✅ Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
3. ✅ Complete [LOCAL_TESTING.md](LOCAL_TESTING.md)
4. ✅ Use [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
5. ✅ Deploy using Vercel

## 🎉 Ready to Launch!

Everything is in place. Start with **[QUICK_START.md](QUICK_START.md)** now!

---

**Status**: ✅ Ready for Local Testing  
**Last Updated**: January 2024

---

## Next Steps

1. **New user?** Start with [QUICK_START.md](QUICK_START.md)
2. **Setting up Firebase?** Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
3. **Local development?** Read [LOCAL_TESTING.md](LOCAL_TESTING.md)
4. **Testing validation?** Use [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
5. **Architecture questions?** Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

**Ready? Begin here:** → [QUICK_START.md](QUICK_START.md)
