# 🚀 DEPLOYMENT GUIDE - Production Ready

## 📋 Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Backend API running
- [ ] Database migrations complete
- [ ] Supabase project created
- [ ] No console errors
- [ ] Mobile tested

---

## 🌐 Frontend Deployment (Next.js)

### Option A: Vercel (Recommended)

**1. Connect Repository**
```bash
git push origin main
```

**2. Go to vercel.com**
- Click "New Project"
- Select "anishas1523-1415/ApexStride"
- Select "web" as root directory

**3. Set Environment Variables**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxx
```

**4. Deploy**
- Click "Deploy"
- Wait for build to complete
- URL: `https://apexstride.vercel.app`

### Option B: Self-Hosted (Docker)

**1. Build Docker Image**
```bash
cd web
docker build -t apexstride-web:latest .
```

**2. Push to Registry**
```bash
docker tag apexstride-web:latest your-registry/apexstride-web:latest
docker push your-registry/apexstride-web:latest
```

**3. Deploy with Docker Compose**
```bash
docker-compose -f docker-compose.yml up -d
```

---

## 🔧 Backend Deployment (FastAPI)

### Option A: Railway (Recommended)

**1. Connect Repository**
```bash
railway login
railway init
```

**2. Configure Environment**
```bash
railway variables
```

Set:
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GOOGLE_API_KEY=...
AURA_LOG_LEVEL=INFO
AURA_ENVIRONMENT=production
```

**3. Deploy**
```bash
railway up
```

URL: `https://apexstride-api.railway.app`

### Option B: Heroku

**1. Login**
```bash
heroku login
heroku create apexstride-api
```

**2. Set Config**
```bash
heroku config:set DATABASE_URL=postgresql://...
heroku config:set REDIS_URL=redis://...
```

**3. Deploy**
```bash
git push heroku main
```

### Option C: Docker + AWS ECS

**1. Build Image**
```bash
cd backend
docker build -t apexstride-backend:latest .
```

**2. Push to ECR**
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag apexstride-backend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/apexstride-backend:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/apexstride-backend:latest
```

**3. Deploy to ECS**
- Go to AWS ECS console
- Create task definition
- Create service
- Configure ALB for load balancing

---

## 🗄️ Database Setup

### PostgreSQL (Cloud)

**Option 1: Railway**
```bash
railway add postgresql
railway variables  # Copy DATABASE_URL
```

**Option 2: AWS RDS**
1. Go to AWS RDS console
2. Create PostgreSQL instance
3. Copy connection string

**Option 3: Heroku Postgres**
```bash
heroku addons:create heroku-postgresql:standard-0
heroku config:get DATABASE_URL
```

### Run Migrations

```bash
cd backend
alembic upgrade head
python seed.py  # Load initial data
```

---

## 💾 Redis Setup

### Option 1: Railway
```bash
railway add redis
railway variables  # Copy REDIS_URL
```

### Option 2: AWS ElastiCache
1. Go to AWS ElastiCache
2. Create Redis cluster
3. Copy endpoint

### Option 3: Heroku Redis
```bash
heroku addons:create heroku-redis:premium-0
heroku config:get REDIS_URL
```

---

## 🔑 Supabase Configuration

**1. Create Project**
- Go to supabase.com
- Click "New Project"
- Select region (US-East recommended)
- Set strong password

**2. Get Credentials**
```
Project URL: https://xxxxx.supabase.co
Anon Key: eyxxxxx (public)
Service Key: eyxxxxx (secret - keep private)
```

**3. Enable Auth**
- Go to Authentication → Providers
- Enable "Email / Password"
- Configure email settings

**4. Create Storage Bucket**
- Go to Storage → New Bucket
- Create "videos" bucket (public)
- Create "photos" bucket (public)

**5. Set CORS**
```json
{
  "allowedOrigins": [
    "https://apexstride.vercel.app",
    "http://localhost:3000"
  ],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["Authorization", "Content-Type"]
}
```

---

## 🎛️ Environment Variables

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxx
NEXT_PUBLIC_ENVIRONMENT=production
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://user:pass@host:6379

# API
API_VERSION=v1
CORS_ORIGINS=["https://apexstride.vercel.app"]

# Environment
AURA_LOG_LEVEL=INFO
AURA_ENVIRONMENT=production
AURA_VERSION=1.0.0

# AI
GOOGLE_API_KEY=your_api_key

# YOLO
YOLO_CONFIDENCE_THRESHOLD=0.5
YOLO_MODEL_NAME=yolov8n-pose.pt

# Video Processing
MAX_VIDEO_SIZE_MB=500
CHUNK_SIZE=64
```

---

## 🔐 SSL/HTTPS

### Vercel
- Automatic SSL via Let's Encrypt
- Enable "Enforce HTTPS" in project settings

### Railway/Heroku
- Automatic SSL included
- Redirect HTTP to HTTPS in nginx

### Self-Hosted
```bash
# Using Let's Encrypt
certbot certonly --standalone -d yourdomain.com

# Configure nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

---

## 📊 Monitoring & Logging

### Frontend Monitoring
- **Vercel Analytics**: Automatic
- **Sentry**: https://sentry.io
- **Google Analytics**: Add tracking ID

### Backend Monitoring
```bash
# Docker logs
docker logs -f container_name

# Railway logs
railway logs

# Heroku logs  
heroku logs --tail

# Application Insights (Azure)
# Datadog
# New Relic
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd web && npm ci && npm run lint

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: web

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/action@main
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
          reference: main
```

---

## ✅ Post-Deployment Verification

**Frontend Check**
```bash
curl https://apexstride.vercel.app
# Should return HTML (no 404)
```

**Backend Check**
```bash
curl https://api.yourdomain.com/api/v1/health
# Should return: {"status": "ok"}
```

**Database Connection**
```bash
cd backend
python -c "from app.database import engine; engine.connect()"
# Should connect without error
```

**API Test**
```bash
# Signup
curl -X POST https://api.yourdomain.com/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email": "test@test.com", "password": "test123", "username": "testuser"}'
```

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache
vercel env pull
rm -rf .vercel
vercel deploy --prod
```

### Database Connection Error
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### CORS Issues
```bash
# Add origin to backend CORS_ORIGINS
export CORS_ORIGINS='["https://apexstride.vercel.app", "https://yourdomain.com"]'
```

### Redis Connection Error
```bash
# Test Redis
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

---

## 📈 Scaling Considerations

**For 10K Users:**
- PostgreSQL: Standard plan (sufficient)
- Redis: Premium (for session management)
- Next.js: Vercel auto-scales
- Backend: 2-4 Railway Dynos

**For 100K Users:**
- PostgreSQL: Production plan with replicas
- Redis: Cluster mode
- CDN: Cloudflare for static assets
- Backend: Kubernetes (EKS/GKE)
- Load Balancer: AWS ALB

---

## 🎯 Go-Live Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database seeded
- [ ] Supabase configured
- [ ] SSL certificates valid
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Error reporting configured
- [ ] CDN enabled (optional)
- [ ] Rate limiting configured
- [ ] API docs accessible
- [ ] Health check endpoints working

---

**Ready for Production!** 🚀
