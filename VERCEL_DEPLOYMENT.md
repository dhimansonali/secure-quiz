# Deploying to Vercel

This guide walks you through deploying both the backend and frontend to Vercel using GitHub.

## Prerequisites

- GitHub account with the repository pushed (✓ Done: https://github.com/dhimansonali/secure-quiz)
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas account for cloud database (https://www.mongodb.com/cloud/atlas)

## Step 1: Set Up MongoDB Atlas (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a password
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/secure_quiz?retryWrites=true&w=majority`
5. **Save this for later** - you'll need it for environment variables

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel CLI

```bash
cd backend
npm install -g vercel
vercel --prod
```

Follow the prompts to link your GitHub repo.

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Select your GitHub repository: `dhimansonali/secure-quiz`
4. In the "Root Directory", select `./backend`
5. Click "Deploy"

## Step 3: Set Environment Variables (Backend)

After deployment, go to **Project Settings** → **Environment Variables** and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/secure_quiz?retryWrites=true&w=majority
MONGODB_DB = secure_quiz
JWT_SECRET = your_super_secret_jwt_key_here
ADMIN_USERNAME = admin
ADMIN_PASSWORD = password123
ALLOWED_ORIGINS = https://secure-quiz-frontend.vercel.app,https://yourdomain.com
```

> **Note:** After setting environment variables, redeploy by pushing a commit or clicking "Redeploy"

## Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Select your GitHub repository: `dhimansonali/secure-quiz`
4. In the "Root Directory", select `./frontend`
5. In "Build and Output Settings":
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click "Deploy"

## Step 5: Set Frontend Environment Variables

After deployment, go to **Project Settings** → **Environment Variables** and add:

```
VITE_API_URL = https://secure-quiz-backend-xxx.vercel.app/api
```

> Replace `secure-quiz-backend-xxx` with your actual backend Vercel domain

## Step 6: Connect Frontend to Backend

1. Get your backend Vercel URL from the backend project
2. Update the frontend environment variable `VITE_API_URL` with the backend URL
3. Redeploy the frontend (push a commit or use Vercel dashboard)

## Step 7: Initialize Admin User (First Deploy)

SSH into the backend or use Vercel Functions to run the seed script:

```bash
cd backend
npm run seed
```

Or manually insert into MongoDB:

```javascript
db.admin_users.insertOne({
  username: "admin",
  password: "$2a$10/..." // bcrypt hash of password123
})
```

## Accessing Your App

- **Frontend:** `https://secure-quiz-frontend.vercel.app`
- **Backend API:** `https://secure-quiz-backend.vercel.app/api`
- **Admin Panel:** `https://secure-quiz-frontend.vercel.app/admin/login`

## Troubleshooting

### "Database connection failed"
- Check MongoDB connection string in environment variables
- Ensure MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0 or add Vercel IP ranges)
- Check `MONGODB_URI` and `MONGODB_DB` are set correctly

### "CORS error"
- Update `ALLOWED_ORIGINS` to include your Vercel domain
- Redeploy the backend

### "Frontend can't reach backend"
- Verify `VITE_API_URL` is correct in frontend environment
- Ensure backend is deployed and responding
- Check browser console for exact error

## Monitoring

- **Vercel Dashboard:** View logs, deployments, and metrics
- **MongoDB Atlas:** Monitor database usage and performance

## Future Updates

1. Make changes locally or on GitHub
2. Push to master branch
3. Vercel will automatically redeploy both services

```bash
git add -A
git commit -m "Your message"
git push origin master
```

---

**Happy deploying!** 🚀
