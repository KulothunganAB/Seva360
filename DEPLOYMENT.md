# Seva360 — Deployment Guide

## Before you deploy

1. Change secrets (never use defaults in production):
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` — long random strings
2. Set `CLIENT_URL` to your real frontend URL (e.g. `https://your-app.vercel.app`)
3. Run seed once on the server: `cd backend && npm run seed`
4. Back up `backend/database/` and `backend/uploads/` (JSON DB + files)

---

## Option A — Easiest split (recommended for beginners)

### Frontend → [Vercel](https://vercel.com)

1. Push the repo to GitHub.
2. In Vercel: **New Project** → import repo → set **Root Directory** to `frontend`.
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Environment variables:

   | Name | Example |
   |------|---------|
   | `VITE_API_URL` | `https://your-api.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-api.onrender.com` |

5. Deploy. Your site will be `https://something.vercel.app`.

### Backend → [Render](https://render.com) (free tier works for demos)

1. **New → Web Service** → connect same GitHub repo.
2. **Root Directory**: `backend`
3. **Build command**: `npm install`
4. **Start command**: `npm start`
5. **Environment variables**:

   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<your-long-secret>
   JWT_REFRESH_SECRET=<your-long-refresh-secret>
   CLIENT_URL=https://your-app.vercel.app
   ```

6. Add a **Persistent Disk** (important) mounted at `/app/database` so JSON data survives restarts.
7. After first deploy, open Render shell or run locally against prod DB once: `npm run seed`
8. Copy the Render URL (e.g. `https://seva360-api.onrender.com`) into Vercel env vars above and redeploy frontend.

---

## Option B — Single VPS (DigitalOcean, AWS EC2, Azure VM)

Good when you want one server for both app and API.

### 1. Server setup (Ubuntu)

```bash
sudo apt update && sudo apt install -y nodejs npm nginx git
# Or install Node 18+ via nvm
```

### 2. Clone and build

```bash
git clone <your-repo-url> seva360
cd seva360/backend
npm install
npm run seed
# Create backend/.env with PORT, JWT_*, CLIENT_URL=https://yourdomain.com

cd ../frontend
npm install
npm run build
# dist/ folder is the static site
```

### 3. Run API with PM2

```bash
sudo npm install -g pm2
cd seva360/backend
pm2 start server.js --name seva360-api
pm2 save
pm2 startup
```

### 4. Nginx

```nginx
# /etc/nginx/sites-available/seva360
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/seva360/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        proxy_pass http://127.0.0.1:5000;
    }

    location /socket.io {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/seva360 /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. HTTPS (Let’s Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Frontend `.env.production` on VPS build:

```
VITE_API_URL=/api
VITE_SOCKET_URL=
```

(Leave socket empty to use same host, or set `https://yourdomain.com`)

---

## Option C — Docker Compose (local / small server)

Requires Dockerfiles in `backend/` and `frontend/`. If missing, use Option A or B.

```bash
# Set secrets in .env at project root
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
CLIENT_URL=http://localhost:5173

docker-compose up --build -d
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  

For production, point `CLIENT_URL` and `VITE_*` to your public domain.

---

## Production checklist

- [ ] Strong `JWT_SECRET` / `JWT_REFRESH_SECRET`
- [ ] `CLIENT_URL` matches live frontend URL (CORS)
- [ ] `VITE_API_URL` points to live API `/api`
- [ ] Database folder persisted (Render disk or VPS backups)
- [ ] HTTPS enabled
- [ ] Demo passwords changed or seed disabled for real users
- [ ] `NODE_ENV=production` on backend

---

## Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin (Chennai) | admin.chennai@seva360.in | admin123 |
| Citizen (Chennai) | citizen.chennai@seva360.in | password123 |

See `backend` seed output for all districts.
