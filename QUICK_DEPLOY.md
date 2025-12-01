# Quick Deployment Guide (Railway)

This is a simplified step-by-step guide for deploying to Railway.

## Prerequisites
- GitHub repository with your code
- OpenAI API key
- Railway account (sign up at https://railway.app)

## Step 1: Deploy PostgreSQL

1. Go to Railway → New Project
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Wait for deployment
4. Click on PostgreSQL service → "Variables" tab
5. Copy the `DATABASE_URL` value

## Step 2: Deploy ChromaDB

1. In the same project → "Add Service" → "Empty Service"
2. Click on the new service → "Settings" → "Deploy" tab
3. Set the Docker image to: `chromadb/chroma:latest`
4. Click "Deploy" and wait for it to start
5. Go to "Settings" → "Networking" → "Add TCP Proxy"
6. Enter port: `8000` (this is the port ChromaDB listens on)
7. Railway will generate a public URL (e.g., `https://chroma-production.up.railway.app`)
8. Copy this URL - this is your `CHROMA_URL`

## Step 3: Deploy Backend

1. "Add Service" → "GitHub Repo"
2. Select your repository
3. Set root directory: `backend`
4. Railway will auto-detect Node.js
5. Go to "Variables" tab, add these:

   ```
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=<paste from Step 1>
   CHROMA_URL=<paste from Step 2>
   OPENAI_API_KEY=<your OpenAI key>
   JWT_SECRET=<run this command: openssl rand -base64 32>
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

6. Click "Deploy"
7. Go to "Settings" → "Networking" → "Generate Domain"
8. Copy the backend URL (e.g., `https://backend-production.up.railway.app`)

## Step 4: Deploy Frontend (Vercel - Recommended)

1. Go to https://vercel.com
2. "Add New Project" → Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Replace with your actual backend URL from Step 3, add `/api` at the end)
5. Click "Deploy"

## Step 5: Update CORS

1. Go back to Railway → Backend service
2. Update the `CORS_ORIGIN` variable to your Vercel frontend URL
3. Redeploy the backend service

## Step 6: Test

1. Visit your Vercel frontend URL
2. Try registering a new user
3. Upload a policy document
4. Test the features

## Troubleshooting

**CORS errors?**
- Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly (with `https://`)
- No trailing slash
- Redeploy backend after changing CORS

**Can't connect to database?**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Make sure all services are in the same Railway project

**ChromaDB not working?**
- Check `CHROMA_URL` includes `https://` or `http://`
- Verify ChromaDB service is running (green status)

**Frontend can't reach backend?**
- Check `VITE_API_URL` is set correctly in Vercel
- Make sure backend URL ends with `/api`
- Check backend is deployed and running

## Cost

- Railway: ~$5-20/month (depending on usage)
- Vercel: Free tier (generous for small apps)
- **Total: ~$5-20/month**

## Next Steps

- Set up custom domain (optional)
- Add monitoring (Sentry, etc.)
- Set up CI/CD for auto-deployments

Done! 🎉

