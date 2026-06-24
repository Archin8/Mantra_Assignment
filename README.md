# Mantra4Change PBL Program Intelligence & Grant Reporting Assistant

## Overview

The **PBL Program Intelligence & Grant Reporting Assistant** is a full-stack analytics platform designed for **Mantra4Change** to transform raw Project-Based Learning (PBL) implementation data into actionable insights for program teams, district leaders, and grant managers.

The platform enables stakeholders to monitor program performance across schools, identify implementation risks early, track grant utilization, and generate evidence-backed reports for donors and leadership teams.

---

## Problem Statement

Education programs often collect large volumes of implementation data across schools, districts, and blocks. However, converting this data into meaningful insights for decision-making and donor reporting is time-consuming and largely manual.

This platform solves that challenge by:

* Centralizing PBL implementation data
* Monitoring program performance in real time
* Identifying underperforming geographies
* Generating grant-ready narratives and reports
* Providing transparent, traceable, and evidence-backed insights


## System Architecture

### Frontend

Built using modern React technologies for performance and scalability.

**Technologies**

* React 18
* Vite
* TypeScript
* Ant Design
* Recharts
* Axios

### Backend

RESTful API architecture designed for maintainability and future extensibility.

**Technologies**

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* node-postgres (pg)
* dotenv
* CORS

### Database

PostgreSQL stores:

* School performance data
* Attendance records
* Evidence submissions
* Grant information
* Financial utilization records
* Generated reports



## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd mantra4-Assignment
```

---

## Backend Setup

### Install Dependencies

```bash
cd Backend
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
PORT=3001

DATABASE_URL=postgresql://username:password@localhost:5432/mantra4change

AI_ENABLED=false

OPENAI_API_KEY=your_openai_key  
```

### Create Database

```bash
createdb mantra4change
```

### Run Schema

```bash
psql -U username -d mantra4change -f schema.sql
```

### Seed Data

```bash
npm run seed
```

### Start Server

```bash
npm run dev
```

Backend URL:

```text
http://localhost:3001
```

---

## Frontend Setup

### Install Dependencies

```bash
cd Frontend
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Start Development Server

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```



Full Stack Developer

Happy Buiding 
