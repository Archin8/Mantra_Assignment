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

---

## Key Features

### Interactive Performance Dashboard

Monitor program implementation through dynamic dashboards with filters for:

* Month
* District
* Block
* Grade
* Subject

Track key performance indicators including:

* Student Participation Rate
* Evidence Submission Rate
* Attendance Rate
* Month-over-Month Growth Trends

---

### District & Block Performance Intelligence

Compare performance across geographies and identify areas requiring intervention.

Capabilities include:

* District ranking
* Block-level performance analysis
* Performance benchmarking
* Trend monitoring

---

### Deterministic Risk Classification Engine

A transparent rule-based risk engine evaluates implementation health using predefined thresholds.

Risk Categories:

| Category | Description                                     |
| -------- | ----------------------------------------------- |
| On Track | Performing above expected benchmarks            |
| Behind   | Slight performance decline requiring monitoring |
| At Risk  | Significant decline requiring intervention      |
| Critical | Immediate action required                       |

Unlike black-box AI systems, every classification is fully explainable and traceable.

---

### Grant Reporting Assistant

Generate donor-ready reporting summaries using program and financial data.

Features include:

* Grant-wise reporting
* Financial utilization tracking
* Milestone monitoring
* Outcome measurement
* Evidence asset aggregation
* Auto-generated narratives

The reporting workflow significantly reduces manual effort while ensuring consistency and auditability.

---

### Export-Ready Review Summaries

Create leadership and donor discussion notes with:

* Key observations
* Risks and challenges
* Success highlights
* Recommended actions
* Supporting evidence

---

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

---

## Project Structure

```text
project-root/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── charts/
│   │
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed-data/
│
└── README.md
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd mantra4change-pbl-assistant
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

---

## API Modules

### Program Analytics

```http
GET /api/dashboard
GET /api/districts
GET /api/blocks
GET /api/performance
```

### Risk Assessment

```http
GET /api/risk-summary
GET /api/risk-analysis
```

### Grant Reporting

```http
GET /api/grants
GET /api/grants/:id/report
```

---

## Future Enhancements

* Predictive risk forecasting
* AI-powered narrative generation
* Multi-year trend analysis
* Automated donor report exports (PDF/Excel)
* Role-based access control
* Notification and alert system

---

## Business Impact

The platform helps Mantra4Change:

* Reduce manual reporting effort
* Improve program monitoring efficiency
* Detect implementation risks earlier
* Increase donor reporting transparency
* Enable evidence-driven decision making

---

## Author

**Archin Chauhan**

Full Stack Developer

Built as part of the Mantra4Change Product Engineering Assessment.
