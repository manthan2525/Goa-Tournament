# 🌐 Full-Stack Online Deployment Guide (100% Free)

Follow this step-by-step guide to take your **Goa Tournament** platform live on the internet so anyone can access it from their mobile phone or PC worldwide.

---

## 📋 Free Hosting Architecture

| Component | Recommended Free Provider | Free Tier |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** or **Netlify** | Unlimited bandwidth & HTTPS |
| **Backend & Socket.IO** | **Render.com** or **Railway.app** | 750 free instance hours/month |
| **Database** | **MongoDB Atlas** | 512 MB Free M0 Cluster (Forever) |
| **Image Storage** | **Cloudinary** | 25 GB Free tier |

---

## 🛠️ Step 1: Push Code to GitHub

1. Initialize git in your project directory:
   ```bash
   cd C:\Users\Manthan\.gemini\antigravity\scratch\goa-tournament
   git init
   git add .
   git commit -m "Initial commit: Goa Tournament Full-Stack Platform"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (e.g. `goa-tournament`).
3. Push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/goa-tournament.git
   git push -u origin main
   ```

---

## 🗄️ Step 2: Set up Free MongoDB Atlas Database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up/log in.
2. Click **Create Cluster** and select the **M0 Free** tier.
3. Choose the region closest to your users (e.g. `ap-south-1 Mumbai`).
4. Under **Security > Database Access**, create a database user:
   - Username: `admin`
   - Password: `your_secure_password`
5. Under **Security > Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
6. Click **Connect > Drivers > Node.js** and copy your connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/goa_tournament?retryWrites=true&w=majority
   ```

---

## ☁️ Step 3: Deploy Backend on Render.com

1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New + > Web Service**.
3. Connect your `goa-tournament` GitHub repository.
4. Fill in the deployment details:
   - **Name:** `goa-tournament-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Click **Advanced > Add Environment Variable** and add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: *(Your MongoDB Atlas connection string from Step 2)*
   - `JWT_SECRET`: `goa_tournament_production_super_secret_jwt_key_2026`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app` *(update once frontend is created)*
   - *(Optional) Cloudinary credentials if configured:* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
6. Click **Create Web Service**.
7. Once deployed, Render will provide your public backend URL (e.g. `https://goa-tournament-api.onrender.com`).

---

## ⚡ Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New... > Project** and import your `goa-tournament` repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: *(Your Render backend URL from Step 3, e.g. `https://goa-tournament-api.onrender.com`)*
5. Click **Deploy**!
6. Once deployed, Vercel will give you a public URL (e.g. `https://goa-tournament.vercel.app`).

---

## 🔄 Step 5: Link CORS in Backend

1. In Render.com under your backend web service, edit the `CLIENT_URL` environment variable to match your new Vercel frontend URL (e.g. `https://goa-tournament.vercel.app`).
2. Trigger a redeploy on Render.

---

## 🎉 You're Live!
Your multi-sport tournament platform is now accessible to players, organizers, and spectators worldwide with real-time live score updates, UPI payments, and automatic brackets!
