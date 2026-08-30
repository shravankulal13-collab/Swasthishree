# Swasthishree — Luxury Living & Hostel Management System

A full-stack hostel and resident management system built for **Swasthishree** to simplify day-to-day hostel operations, resident management, payments, rooms, visitors, notices, and other administrative tasks.

The system is built using **Express.js, React, Vite, and Supabase**, with PostgreSQL used for structured data management and Supabase Storage for file uploads.

## Features

### Resident Management

* Add, update, and manage resident details
* View individual resident information
* Maintain resident records and documents
* Search and manage residents easily

### Room & Bed Management

* Floor-wise room and bed management
* Visual representation of room occupancy
* Track available and occupied beds
* Keep room allocation information organized

### Payments & Rent

* Track monthly rent payments
* Maintain payment history
* Support different payment methods
* Generate printable rent receipts and invoices

### Complaints & Maintenance

* Record maintenance and resident complaints
* Track complaint status and priority
* Manage issues through a simple workflow

### Visitor Management

* Record visitor details
* Track check-in and check-out times
* Maintain a history of hostel visitors

### Mess Management

* Manage the weekly mess menu
* Separate schedules for breakfast, lunch, snacks, and dinner
* Display the menu in an easy-to-read format

### Notices

* Publish hostel notices and announcements
* Display important updates for residents
* Support emergency announcements

### Dashboard

* Overview of hostel activity
* Resident and occupancy statistics
* Payment information
* Quick access to important sections

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* CSS

**Backend**

* Node.js
* Express.js

**Database & Storage**

* Supabase
* PostgreSQL
* Supabase Storage

## Project Structure

```text
Swasthishree/
│
├── backend/
│   ├── server.js
│   ├── src/
│   ├── supabase_schema.sql
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── DEPLOYMENT_GUIDE.md
├── package.json
└── README.md
```

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

### 2. Configure environment variables

Create a `.env` file inside the `backend` folder.

Use `backend/.env.example` as a reference.

```text
backend/
└── .env
```

Add the required Supabase configuration to the file.

> Do not commit the `.env` file to GitHub.

### 3. Set up Supabase

Open the Supabase SQL editor and run:

```text
backend/supabase_schema.sql
```

This creates the required database tables, relationships, triggers, and other database configuration used by the application.

Supabase Storage is also used for storing resident-related files such as ID proofs and photos.

### 4. Start the backend

```bash
npm run dev:backend
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Start the frontend

Open another terminal and run:

```bash
npm run dev:frontend
```

The frontend will be available at:

```text
http://localhost:5173
```

## Environment Variables

The backend requires Supabase configuration.

Example:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Use the actual values in your local `.env` file. Never commit production keys or secret keys to the repository.

## Database

The project uses **Supabase PostgreSQL** for storing application data.

The database includes information related to:

* Residents
* Rooms
* Beds
* Payments
* Complaints
* Visitors
* Notices
* Mess menus
* Other hostel management records

Database setup and configuration can be found in:

```text
backend/supabase_schema.sql
```
