# NivasaAI - Smart Society Operations & Predictive Maintenance Platform

> “NivasaAI transforms residential communities from reactive complaint management into intelligent, data-driven and predictive maintenance operations.”

NivasaAI is a premium, modern SaaS platform designed to streamline residential society management by leveraging Artificial Intelligence (NLP) for complaint classification, priority predictions, recurring issue detection, and asset risk scoring (predictive maintenance).

---

## Key Features

1. **Role-Based Portals**: Distinct dashboards for Residents and Administrators with secure JWT authorization.
2. **AI Complaint Lifecycle Management**:
   - **Auto-Prediction**: Deep learning-based classification of complaint category and priority during filing.
   - **Confidence & Explanations**: Generates confidence levels and explainable recommendations for administrators.
   - **Recurring Issue Detection**: Natural language processing (TF-IDF Cosine Similarity) links incoming duplicates to a master parent ticket.
3. **Predictive Maintenance Risk Scoring**:
   - Live health score tracking for society machinery (elevators, generators, water pumps).
   - Generates risk indicators based on installation age, maintenance delays, and operational ticket history.
4. **Complaint Volume Forecasting**:
   - Polynomial regression time-series forecasting projects complaint volume for the next 30 days.
5. **Notice Board & Broadcasts**: Important and pinned broadcasts pushed immediately to resident dashboards.
6. **Admin AI Assistant (RAG)**:
   - Interactive chatbot enabling administrators to query society statistics, asset health, and notices.
7. **Secure Audit & History Tracker**:
   - Full chronological transition logs for all tickets tracking status changes, comments, and operator actions.

---

## Technical Stack

* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Recharts
* **Backend**: FastAPI (Python), SQLAlchemy ORM, scikit-learn, Pandas, NumPy
* **Database**: PostgreSQL

---

## Database Architecture & Entity Relationship

```
+------------------+         +-------------------------+         +-----------------------+
|      users       |         |       complaints        |         |  complaint_histories  |
+------------------+         +-------------------------+         +-----------------------+
| id [PK]          |<--------| resident_id [FK]        |    +--->| id [PK]               |
| email            |<---+    | assigned_admin_id [FK]  |----+    | complaint_id [FK]     |
| hashed_password  |    |    | title                   |         | status_from           |
| full_name        |    |    | description             |         | status_to             |
| role             |    |    | category                |         | changed_by_id [FK]    |
| flat_number      |    |    | location                |         | comment               |
| phone_number     |    |    | priority                |         | created_at            |
| created_at       |    |    | status                  |         +-----------------------+
+------------------+    |    | photo_url               |
                        |    | is_recurring            |         +-----------------------+
+------------------+    |    | parent_recurring_id [FK]|         |        assets         |
|   notifications  |    |    | ai_confidence_score     |         +-----------------------+
+------------------+    |    | ai_explanation          |         | id [PK]               |
| id [PK]          |    |    | risk_score              |         | name                  |
| user_id [FK] ----+----+    | created_at              |         | category              |
| title            |         | resolved_at             |         | location              |
| message          |         +-------------------------+         | install_date          |
| is_read          |                                             | last_maintenance_date |
| channel          |         +-------------------------+         | status                |
| created_at       |         |         notices         |         | health_score          |
+------------------+         +-------------------------+         | risk_score            |
                             | id [PK]                 |         | risk_level            |
+------------------+         | title                   |         | created_at            |
|    audit_logs    |         | content                 |         +-----------------------+
+------------------+         | is_pinned               |
| id [PK]          |         | is_important            |
| user_id [FK] ----+         | created_by_id [FK]      |
| action           |         | created_at              |
| target_table     |         +-------------------------+
| target_id        |
| description      |
| ip_address       |
| created_at       |
+------------------+
```

---

## Local Development Setup

### Backend Prerequisites & Configuration
1. Initialize local PostgreSQL and create database `nivasa_ai`.
2. Navigate to `backend/` folder.
3. Configure environment variables in `.env` or set defaults:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nivasa_ai
   JWT_SECRET=nivasa_ai_super_secret_key_123456789
   ```
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the DB Seeding script to initialize tables and populate demo data:
   ```bash
   python seed.py
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Prerequisites & Configuration
1. Navigate to `frontend/` folder.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js app in development mode:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Compose Execution

To run the entire multi-container application stack automatically:
```bash
docker-compose up --build
```
This builds and starts:
* PostgreSQL Database Container on port `5432`
* FastAPI Backend Container on port `8000`
* Next.js Frontend Container on port `3000`

---

## Testing Guidelines

Execute the Python pytest test suite to verify ML classifications, predictions, forecasting, and calculations:
```bash
pytest backend/test_ml.py
```
