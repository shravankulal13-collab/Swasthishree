# 🏢 Swasthishree - Production Launch & Deployment Guide

Welcome to the **Swasthishree Luxury Living & Hostel Management Platform**. This document provides clear, step-by-step instructions to connect your Supabase database and launch the application to your client.

---

## ⚡ Quick Start (Local Run in 2 Steps)

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run dev
```
*Backend will start on: `http://localhost:5000`*

### 2. Start the Frontend Dashboard (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*Frontend will launch on: `http://localhost:5173`*

---

## 🚀 Connecting to Your Supabase Database

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project**, name it `swasthishree-db`, choose a region and strong database password.

### Step 2: Run the SQL Schema Migration
1. In your Supabase dashboard, click **SQL Editor** on the left menu.
2. Click **New Query**.
3. Open the file `backend/supabase_schema.sql` from this project, copy all its contents, paste them into the Supabase SQL editor, and click **Run**.
4. This will automatically create:
   - `rooms` table (with floor, room type, total & occupied bed tracking)
   - `residents` table (with photos, contact, parent info, rent)
   - `payments` table (with receipt numbers and financial ledger)
   - `complaints` table (with priority tickets and maintenance workflow)
   - `visitors` table (with gate check-in/out timestamps)
   - `mess_menu` table (weekly breakfast, lunch, snacks, dinner schedule)
   - `notices` table (hostel broadcasts and circulars)
   - `resident-photos` Storage Bucket for avatars & ID proofs
   - Automatic triggers to sync room occupancy counts
   - Complete starter seed data

### Step 3: Configure Environment Variables
Open `backend/.env` and insert your Supabase credentials (found in **Project Settings > API**):
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
Restart the backend (`npm run dev`), and the system will automatically connect to your live PostgreSQL Supabase database!

---

## ☁️ Production Deployment (Cloud Hosting)

### Option A: Frontend on Vercel + Backend on Render / Railway

#### 1. Deploy Frontend (Vercel)
1. Push this repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-api.onrender.com`

#### 2. Deploy Backend (Render)
1. In [Render](https://render.com), click **New + > Web Service**.
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables:
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

---

## 📋 Client Features Summary
- **Executive Dashboard**: Live occupancy rate %, total active residents, monthly collected vs pending revenue, open maintenance tickets.
- **Resident Directory**: Filterable student profiles, photo avatars, room allocations, guardian contacts, one-click WhatsApp/Call shortcuts.
- **Room & Bed Matrix**: Floor-by-floor interactive room map with visual bed slots (vacant vs occupied).
- **Billing & Printable Invoices**: Instant branded official rent receipts with print/PDF export and receipt numbers.
- **Maintenance & Complaints Desk**: Priority-tagged service ticketing with In-Progress / Resolved workflow.
- **Gate & Visitor Pass**: Guest check-in logging with relation, phone, and time-stamped check-out.
- **Weekly Dining / Mess Menu**: Day-by-day food chart (Breakfast, Lunch, Snacks, Dinner) with inline editor.
- **Notice Board Broadcasts**: Emergency alerts and circulars pinned to the resident dashboard.
- **Supabase Cloud Diagnostics**: Real-time connectivity monitor and 1-click status checker.
