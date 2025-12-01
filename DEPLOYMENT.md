# Deployment Guide

This guide covers deploying the Pet Insurance Assistant application, which consists of:
- **Frontend**: React/Vite application
- **Backend**: Express.js/Node.js API
- **PostgreSQL**: Relational database
- **ChromaDB**: Vector database for embeddings

## Deployment Architecture Overview

```
┌─────────────┐
│  Frontend   │  (Static site - Vercel/Netlify)
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Backend   │  (Node.js - Railway/Render/Fly.io)
│  (Express)  │
└──────┬──────┘
       │
       ├──► PostgreSQL (Managed service)
       │
       └──► ChromaDB (Self-hosted or managed)
```

## Option 1: All-in-One Platform (Easiest for MVP)

### Railway (Recommended for Simplicity)

**Pros:**
- Deploy frontend, backend, PostgreSQL, and ChromaDB all in one place
- Automatic HTTPS, environment variables, and deployments
- Free tier available
- Simple Docker-based deployment

**Steps:**

1. **Create Railway Account**: https://railway.app

2. **Deploy PostgreSQL**:
   - New Project → Add PostgreSQL
   - Copy the `DATABASE_URL` connection string

3. **Deploy ChromaDB**:
   - New Service → Deploy from Dockerfile
   - Use ChromaDB Docker image: `chromadb/chroma:latest`
   - Expose port 8000
   - Copy the service URL (e.g., `https://chroma-xxx.railway.app`)

4. **Deploy Backend**:
   - New Service → Deploy from GitHub repo
   - Select `backend` directory
   - Set environment variables:
     ```
     NODE_ENV=production
     PORT=8080
     DATABASE_URL=<from PostgreSQL service>
     CHROMA_URL=<from ChromaDB service>
     OPENAI_API_KEY=<your key>
     JWT_SECRET=<generate: openssl rand -base64 32>
     CORS_ORIGIN=<your frontend URL>
     ```
   - Railway will auto-detect Node.js and build

5. **Deploy Frontend**:
   - New Service → Deploy from GitHub repo
   - Select `frontend` directory
   - Set build command: `npm run build`
   - Set start command: `npm run preview` (or use static hosting)
   - Set environment variable:
     ```
     VITE_API_URL=<your backend URL>
     ```

**Cost**: ~$5-20/month for small usage

---

## Option 2: Separate Services (More Control)

### Frontend: Vercel or Netlify

**Vercel (Recommended)**:
1. Connect GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_URL=<backend-url>`

**Netlify**:
1. Connect GitHub repo
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variable: `VITE_API_URL=<backend-url>`

### Backend: Railway, Render, or Fly.io

**Railway**:
- Same as Option 1, step 4

**Render**:
1. New Web Service → Connect GitHub
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set environment variables (same as Railway)

**Fly.io**:
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In `backend` directory: `fly launch`
3. Follow prompts and set environment variables

### PostgreSQL: Managed Services

**Options:**
- **Railway**: Included in Option 1
- **Supabase**: Free tier, PostgreSQL + extras
- **Neon**: Serverless PostgreSQL, free tier
- **Render**: Managed PostgreSQL, free tier
- **AWS RDS**: More complex, pay-as-you-go

**Recommended**: Supabase (free tier, easy setup)

### ChromaDB: Self-Hosted

**Option A: Railway/Render (Docker)**
- Deploy ChromaDB Docker container
- Expose port 8000
- Use the service URL

**Option B: Fly.io**
- Create `fly.toml` for ChromaDB
- Deploy as separate service

**Option C: VPS (DigitalOcean, Linode)**
- Spin up a $5/month droplet
- Install Docker: `docker run -d -p 8000:8000 chromadb/chroma:latest`
- Use VPS IP: `http://your-vps-ip:8000`

**Option D: Managed Service (if available)**
- Check ChromaDB cloud offerings (may be in beta)

---

## Option 3: Docker Compose (Local/Production)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pet_insurance
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/pet_insurance
      CHROMA_URL: http://chromadb:8000
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      - postgres
      - chromadb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:8080
    depends_on:
      - backend

volumes:
  postgres_data:
  chroma_data:
```

Deploy to:
- **DigitalOcean App Platform**
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**

---

## Step-by-Step: Railway Deployment (Recommended)

### Prerequisites
- GitHub account with your code pushed
- OpenAI API key
- Railway account (free tier available)

### 1. Deploy PostgreSQL

1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Click on PostgreSQL service → Variables tab
4. Copy `DATABASE_URL` (you'll need this)

### 2. Deploy ChromaDB

1. In same project → New Service → Empty Service
2. Go to Settings → Generate Dockerfile
3. Replace with:
   ```dockerfile
   FROM chromadb/chroma:latest
   EXPOSE 8000
   ```
4. Deploy
5. Go to Settings → Networking → Generate Domain
6. Copy the URL (e.g., `https://chroma-production.up.railway.app`)

### 3. Deploy Backend

1. New Service → Deploy from GitHub repo
2. Select repository → Set root directory to `backend`
3. Railway will auto-detect Node.js
4. Go to Variables tab, add:
   ```
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=<paste from step 1>
   CHROMA_URL=<paste from step 2>
   OPENAI_API_KEY=<your key>
   JWT_SECRET=<run: openssl rand -base64 32>
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
5. Deploy
6. Go to Settings → Networking → Generate Domain
7. Copy backend URL

### 4. Deploy Frontend

**Option A: Railway**
1. New Service → Deploy from GitHub repo
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Start command: `npx serve -s dist -l 3000`
5. Add environment variable:
   ```
   VITE_API_URL=<your backend URL from step 3>
   ```
6. Deploy

**Option B: Vercel (Recommended for frontend)**
1. Go to https://vercel.com
2. Import Git Repository
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variable:
   ```
   VITE_API_URL=<your backend URL>
   ```
7. Deploy

### 5. Update CORS

1. Go back to Railway backend service
2. Update `CORS_ORIGIN` variable to your frontend URL
3. Redeploy backend

---

## Environment Variables Checklist

### Backend Required:
- `NODE_ENV=production`
- `PORT=8080` (or Railway-assigned port)
- `DATABASE_URL=<postgres connection string>`
- `CHROMA_URL=<chromadb url>`
- `OPENAI_API_KEY=<your key>`
- `JWT_SECRET=<random 32+ char string>`
- `CORS_ORIGIN=<frontend url>` (NOT `*` in production!)

### Frontend Required:
- `VITE_API_URL=<backend url>`

### Optional:
- `JWT_EXPIRES_IN=7d` (default)
- `LOG_LEVEL=info` (default)

---

## Post-Deployment Checklist

- [ ] Test frontend loads correctly
- [ ] Test user registration/login
- [ ] Test file upload
- [ ] Test policy summary extraction
- [ ] Test Q&A functionality
- [ ] Test policy comparison
- [ ] Test claim checklist
- [ ] Verify CORS is working (no CORS errors in browser console)
- [ ] Check backend logs for errors
- [ ] Verify database connections
- [ ] Verify ChromaDB connections
- [ ] Test on mobile device
- [ ] Set up monitoring (optional: Sentry, LogRocket)

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` is set to exact frontend URL (with https://)
- No trailing slash
- Redeploy backend after changing CORS_ORIGIN

### Database Connection Errors
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check if database is accessible from backend service
- Railway: Ensure services are in same project

### ChromaDB Connection Errors
- Verify `CHROMA_URL` includes protocol: `http://` or `https://`
- Check ChromaDB service is running
- Verify port is correct (8000)

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` is correct
- Check backend is deployed and running
- Verify CORS settings

---

## Cost Estimates

### Railway (All-in-One)
- Free tier: Limited usage
- Hobby: $5/month per service
- Pro: $20/month per service
- **Estimated**: $15-40/month for full stack

### Vercel + Railway
- Vercel: Free tier (generous)
- Railway: $5-20/month
- **Estimated**: $5-20/month

### Vercel + Render
- Vercel: Free
- Render: Free tier available
- **Estimated**: $0-15/month

### DigitalOcean
- App Platform: $12/month minimum
- Managed PostgreSQL: $15/month
- **Estimated**: $27+/month

---

## Security Considerations

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with `openssl rand -base64 32`
3. **Set CORS_ORIGIN** - Never use `*` in production
4. **Use HTTPS** - All services should use HTTPS
5. **Database credentials** - Use managed services with secure defaults
6. **API keys** - Store in environment variables, never in code
7. **Rate limiting** - Consider adding rate limiting for production
8. **Monitoring** - Set up error tracking (Sentry, etc.)

---

## Next Steps

1. Choose deployment option based on your needs
2. Set up services in order: PostgreSQL → ChromaDB → Backend → Frontend
3. Test thoroughly in production
4. Set up monitoring and error tracking
5. Consider adding CI/CD for automatic deployments

Good luck with your deployment! 🚀

