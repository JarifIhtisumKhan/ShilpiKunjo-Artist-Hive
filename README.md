# ShilpiKunjo (Artist Hive) 🎨✨

**ShilpiKunjo (Artist Hive)** is a full-stack platform designed for South Asian artists and creators to showcase artwork, participate in creative challenges, list products on an art marketplace, manage custom commissions, and host/enroll in creative courses.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js, Express.js
- **Database**: 
  - **MariaDB / MySQL** (Primary database via XAMPP)
  - **SQLite** (Fallback database stored locally at `server/shilpikunjo.db`)

---

## 📋 Prerequisites

Before running the application, ensure you have:
1. [Node.js](https://nodejs.org/) (v18.0.0 or higher) & `npm`
2. **XAMPP Control Panel** (or MariaDB / MySQL Server running on `localhost:3306`)

---

## 🚀 How to Run the Project Manually

Follow these step-by-step instructions to set up and run the application:

### 1️⃣ Start MySQL in XAMPP

1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (ensuring it is running on port `3306`).

---

### 2️⃣ Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

> **Note for Windows PowerShell users:** If you encounter a script execution policy error (`npm.ps1 cannot be loaded`), run the command via CMD:
> ```cmd
> cmd /c npm install
> ```

---

### 3️⃣ Seed the MariaDB / MySQL Database

Create the `shilpikunjo` database, apply table schemas, and insert sample data:

```bash
npm run seed
```
*(Or directly: `node server/seed.js`)*

Expected output:
```text
--- Initializing MariaDB Schema ---
Connected to MariaDB/MySQL database: shilpikunjo
MariaDB DDL Schema applied successfully.
--- Clearing Existing Records in MariaDB ---
--- Seeding MariaDB with ShilpiKunjo Data ---
--- MariaDB Database Successfully Populated! ---
```

---

### 4️⃣ Start the Backend Express Server

Start the backend API server on port **5000**:

```bash
npm run server
```
*(Or directly: `node server/index.js`)*

Expected output:
```text
ShilpiKunjo MariaDB Backend Server listening on http://localhost:5000
Connected to MariaDB/MySQL database: shilpikunjo
```

---

### 5️⃣ Start the Frontend Dev Server

In a new terminal window/tab, run the Vite development server on port **3000**:

```bash
npm run dev
```

---

### 6️⃣ Open the Application in Your Browser

Navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Pre-configured Demo Accounts

All demo accounts share the password: **`password123`**

| Role | Username | Email | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@sk.com` | System Administrator |
| **Artist** | `rubab_sazda` | `rubab@sk.com` | Rubab Sazda |
| **Artist** | `jarif` | `jarif@sk.com` | Jarif |
| **Artist** | `fairuz` | `fairuz@sk.com` | Fairuz |
| **Artist** | `rudila` | `rudila@sk.com` | Rudila |

---

## 🗄️ Database Environment Configuration

By default, the backend connects to XAMPP MySQL at `localhost:3306` with user `root` and no password. 

If your XAMPP MySQL configuration uses custom credentials, set these environment variables before starting the backend:

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `3306` | Database port |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | `""` *(empty)* | Database password |

---

## 📁 Project Structure

```text
ShilpiKunjo-Artist-Hive/
├── backend/
│   └── mariadb_schema.sql      # MariaDB DDL schema script
├── public/
│   └── artworks/               # Artwork images & static assets
├── server/
│   ├── db.js                   # MariaDB / MySQL database connection pool
│   ├── index.js                # Express API routes server
│   └── seed.js                 # Database seeder script
├── src/                        # React frontend components & pages
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies & scripts
├── README.md                   # Setup guide & documentation
└── vite.config.js              # Vite config & API proxy settings
```

---

## 📜 NPM Scripts

- `npm run dev` – Starts the Vite frontend dev server at `http://localhost:3000`
- `npm run server` – Starts the Express backend server at `http://localhost:5000`
- `npm run seed` – Applies database schema & populates initial sample data in MariaDB/MySQL
- `npm run build` – Builds production bundle
- `npm run preview` – Previews production build locally
