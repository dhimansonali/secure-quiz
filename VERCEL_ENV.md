# Vercel Environment Variables

This document outlines all the environment variables required for deploying the Secure Quiz application to Vercel.

## Required Environment Variables

### Database Configuration
- **MONGODB_URI**: MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/secure_quiz`
  - Get this from your MongoDB Atlas dashboard

### Application Configuration
- **MONGODB_DB**: Database name
  - Value: `secure_quiz`

### Admin Authentication
- **ADMIN_USERNAME**: Admin username for dashboard access
  - Value: `admin`
- **ADMIN_PASSWORD**: Admin password for dashboard access
  - Choose a strong password
- **JWT_SECRET**: Secret key for JWT token generation
  - Generate a random string: `openssl rand -base64 32`
  - Example: `your_super_secret_jwt_key_here_make_it_long_and_random`

### CORS Configuration
- **ALLOWED_ORIGINS**: Comma-separated list of allowed origins
  - Example: `https://yourdomain.vercel.app,https://yourdomain.com`

## Setting Up Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the correct value

## Vercel-Specific Variables

Vercel automatically provides these:
- **VERCEL_URL**: Your deployment URL
- **VERCEL_ENV**: Environment (production, preview, development)

## Firebase Configuration (Optional)

If using Firebase for additional features:
- **VITE_FIREBASE_API_KEY**: Firebase API key
- **VITE_FIREBASE_AUTH_DOMAIN**: Firebase auth domain
- **VITE_FIREBASE_PROJECT_ID**: Firebase project ID
- **VITE_FIREBASE_STORAGE_BUCKET**: Firebase storage bucket
- **VITE_FIREBASE_MESSAGING_SENDER_ID**: Firebase messaging sender ID
- **VITE_FIREBASE_APP_ID**: Firebase app ID

## Security Notes

- Never commit actual secrets to git
- Use Vercel's environment variables for sensitive data
- Use strong, unique passwords and JWT secrets
- Regularly rotate your secrets

## Deployment Checklist

Before deploying to Vercel:
- [ ] Set up MongoDB Atlas cluster
- [ ] Get MongoDB connection string
- [ ] Generate JWT secret
- [ ] Set admin password
- [ ] Configure allowed origins
- [ ] Add all environment variables to Vercel
- [ ] Test the deployment

## Troubleshooting

If you encounter issues:
1. Check all environment variables are set correctly
2. Verify MongoDB connection string format
3. Ensure CORS origins include your Vercel URL
4. Check Vercel function logs for errors
