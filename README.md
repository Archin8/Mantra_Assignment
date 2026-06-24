Mantra4Change PBL Program Intelligence & Grant Reporting Assistant
A full‑stack application that transforms raw school‑level PBL data into actionable program insights and grant‑ready reports. Built with React + Vite + Ant Design + Recharts for the frontend, Node.js + Express + PostgreSQL for the backend, and a deterministic risk engine for transparent decision support.


 Features
Interactive Dashboard – Filter by month, district, block, grade, and subject. View KPIs (participation, evidence, attendance) with month‑over‑month trends.

District & Block Performance – Instantly see high‑ and low‑performing geographies with risk classifications (On Track / Behind / At Risk / Critical).

Deterministic Risk Engine – Code‑based thresholds classify performance, no AI black boxes.

Grant Reporting Assistant – Select a grant and month to view finance utilization, outcomes, milestones, evidence assets, and an auto‑generated narrative (AI‑enhanced or rule‑based).

Export‑ready Summaries – Prepare review discussion points and grant sections with traceable source facts.


 Tech Stack
Frontend
Vite – fast build tool and dev server

React 18 – UI library

TypeScript – type safety

Ant Design – component library and theming

Recharts – charting library for KPIs and trends

Axios – HTTP client

Backend
Node.js + Express – REST API server

PostgreSQL – relational database

node‑postgres (pg) – database driver

TypeScript – type safety

dotenv – environment variables

CORS – cross‑origin support


nstallation & Setup
1. Clone the Repository

git clone <repository‑url>



 Backend Setup
bash
cd Backend
npm install
Create a .env file in the Backend folder:

env
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/mantra4change"
AI_ENABLED=false
OPENAI_API_KEY=your_key_here   # optional
Run database migrations (or execute the provided schema.sql):

# If you have the schema.sql file, run:
psql -U username -d mantra4change -f schema.sql

# Seed the database with CSV data:
npm run seed
Start the backend server:

bash
npm run dev
The API will be available at http://localhost:3001.


. Frontend Setup
bash
cd Frontend
npm install
Create a .env file in the Frontend folder:

env
VITE_API_BASE_URL=http://localhost:3001/api
Start the development server:

bash
npm run dev
The app will be available at http://localhost:3000.

Happy Building! 

