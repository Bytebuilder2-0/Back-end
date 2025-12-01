# Backend Deployment Guide

## 🚀 Deploy to Render (Free Tier)

### **Prerequisites:**
- GitHub repository with your backend code
- MongoDB Atlas account (free tier)
- Stripe account (if using payments)

---

## **Step 1: Prepare MongoDB Database**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a **Free Cluster** (M0 Sandbox)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/yourdbname?retryWrites=true&w=majority
   ```
6. Replace `<username>`, `<password>`, and `yourdbname` with your values
7. **Important:** Add `0.0.0.0/0` to IP Access List (allows connections from anywhere)

---

## **Step 2: Deploy to Render**

1. **Go to [Render.com](https://render.com)** and sign up with GitHub

2. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select your backend repository

3. **Configure Settings:**
   - **Name**: `your-app-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `depl` (or `main`)
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB connection string from Step 1 |
   | `JWT_SECRET` | A random secure string (e.g., `your-super-secret-jwt-key-12345`) |
   | `STRIPE_SECRET_KEY` | Your Stripe secret key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |

5. **Click "Create Web Service"**

6. Wait 3-5 minutes for deployment

7. **Your backend URL will be:**
   ```
   https://your-app-backend.onrender.com
   ```

---

## **Step 3: Test Your Backend**

Test these endpoints:
```bash
# Health check (should return 404 or your routes)
https://your-app-backend.onrender.com

# Auth endpoint
https://your-app-backend.onrender.com/api/auth/login
```

---

## **Step 4: Update Frontend Environment Variable**

In your frontend Vercel deployment, update:
```
VITE_API_BASE_URL=https://your-app-backend.onrender.com/api
```

---

## **Important Notes:**

⚠️ **Free Tier Limitations:**
- Service spins down after 15 minutes of inactivity
- First request after idle takes ~30 seconds to wake up
- 750 hours/month free

💡 **Upgrade Options:**
- Render Starter ($7/month) - No spin down
- Railway ($5/month credit)
- Heroku ($5-7/month)

---

## **Troubleshooting:**

### Database Connection Issues:
- Verify MongoDB connection string is correct
- Check MongoDB Network Access (IP whitelist)
- Ensure database user has read/write permissions

### CORS Errors:
- Already configured in your `server.js`
- Make sure frontend URL is deployed

### Environment Variables Not Working:
- Double-check spelling in Render dashboard
- Redeploy after adding/changing variables

---

## **Alternative: Deploy to Railway**

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your backend repository
5. Add environment variables (same as above)
6. Railway gives you: `https://your-app.railway.app`

---

## **Next Steps:**
1. ✅ Deploy backend to Render
2. ✅ Get your backend URL
3. ✅ Update frontend `VITE_API_BASE_URL` in Vercel
4. ✅ Redeploy frontend
5. ✅ Test your full application!
