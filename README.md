# FINOPT — Smarter Financial Decisions, Simplified

> **"Your money. Your goals. Better options."**  
> Built by Team **The Hustlers** for the Hackathon.

---

## 1. What is FINOPT?

FINOPT is a personalized financial-product comparison and decision-support platform designed to help retail depositors make confident, high-conviction financial decisions.

### The Problem
Traditional financial comparison platforms are **product-centric**: they present overwhelming tables of interest rates and complex bank jargon, forcing individuals to manually calculate maturity values, compare inconsistent tenures, and puzzle over fine print. As a result, users hesitate and leave their surplus capital idling in low-yield accounts.

### FINOPT's Approach
FINOPT reverses this flow to **Requirement-First**:
$$\text{Customer Requirement} \longrightarrow \text{Suitable Products \& Trade-offs}$$

Users simply state their financial situation (Amount, Desired Time Horizon, Primary Goal, and Liquidity Preference). FINOPT's deterministic engine filters, calculates, compares, ranks, and clearly explains suitable fixed-return options.

### Key Differentiator: Close-Range Alternatives & Tenure Optimization ⭐
Most portals only match the exact tenure requested (e.g., exactly 12 months). FINOPT actively evaluates nearby tenure brackets (e.g., 9, 15, or 18 months) to quantify clear trade-offs:
* **Yield Extension (Longer Tenure):** *"Lock in for 3 more months $\rightarrow$ earn ₹X extra at maturity."*
* **Liquidity Preservation (Shorter Tenure):** *"Shorten tenure to 9 months $\rightarrow$ preserve emergency liquidity with negligible yield loss."*

---

## 2. Tech Stack

### Frontend
* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React

### Backend
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
* **Server:** Uvicorn
* **Validation & Data Modeling:** Pydantic v2
* **Testing:** Pytest & HTTPX TestClient

### Database (Roadmap)
* PostgreSQL (designed with database-ready entities; to be integrated in a subsequent phase)

---

## 3. Current Architecture (Phase 2)

```
finopt/
├── README.md                          # Project documentation & execution guide
├── .gitignore                         # Git exclusion rules
├── backend/
│   ├── main.py                        # FastAPI routes (/api/health, /api/products, /api/recommend)
│   ├── models.py                      # Pydantic entity & recommendation models
│   ├── data.py                        # Curated illustrative demo dataset (10 fictional bank products)
│   ├── calculator.py                  # Compound interest calculation engine
│   ├── matcher.py                     # Eligibility filtering (amount range, tenure window)
│   ├── ranker.py                      # Multi-factor explainable scoring system
│   ├── optimizer.py                   # Close-range tenure optimization algorithm
│   ├── requirements.txt               # Backend dependencies
│   └── test_main.py                   # Comprehensive deterministic test suite
└── frontend/
    ├── app/
    │   ├── globals.css                # Global styles & Tailwind directives
    │   ├── layout.tsx                 # Root layout with Navbar & Footer
    │   └── page.tsx                   # Main intake page
    ├── components/
    │   ├── Navbar.tsx                 # Header with branding & phase badge
    │   ├── Hero.tsx                   # Core value propositions
    │   ├── RequirementForm.tsx        # Intake form connected to /api/recommend
    │   ├── RecommendationResults.tsx  # Best Match, Tenure Optimization & Alternatives cards
    │   ├── Disclaimer.tsx             # Prototype safety notice
    │   └── Footer.tsx                 # Attribution and project footer
    ├── types/
    │   └── index.ts                   # TypeScript interfaces
    ├── package.json                   # Node dependencies and scripts
    ├── tsconfig.json                  # TypeScript compiler options
    ├── next.config.js                 # Next.js configuration with backend API proxy rewrites
    ├── tailwind.config.ts             # Tailwind CSS theme
    └── postcss.config.js              # PostCSS plugins
```

---

## 4. How to Install and Run

### Prerequisites
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+) & **pip**

---

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   * On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run backend development server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API runs at `http://localhost:8000`.

5. **Run backend tests:**
   ```bash
   pytest -v
   ```

---

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run frontend development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## 5. Phase 2 Features Implemented

* [x] **Curated Demo Dataset (`data.py`):** 10 fictional bank products across representative categories with multiple tenures (6m to 36m), explicit compounding frequencies, and clear hackathon demo disclaimers.
* [x] **Deterministic Financial Calculator (`calculator.py`):** Precise compound interest formula $A = P(1 + r/n)^{nt}$ with explicit compounding frequencies (monthly, quarterly, semi-annual, annual) and thorough input validation.
* [x] **Product Eligibility Matcher (`matcher.py`):** Filters based on minimum and maximum amount bounds and active tenure windows.
* [x] **Explainable Multi-Factor Ranking (`ranker.py`):** Transparent score out of 100 based on tenure fit (30), yield competitiveness (35), liquidity fit (20), and goal alignment (15), providing clear plain-language rationale bullets for every recommendation.
* [x] **Close-Range Tenure Optimization (`optimizer.py`):** Automatically evaluates adjacent tenures ($\pm 3$ to $6$ months). Evaluates yield extensions for return-oriented goals and liquidity preservation for liquidity-oriented goals.
* [x] **REST API (`main.py`):**
  * `GET /api/health`: Health status.
  * `GET /api/products`: Full list of demo products and tenures.
  * `POST /api/recommend`: End-to-end recommendation and optimization pipeline.
* [x] **Frontend UI Integration (`RequirementForm.tsx` & `RecommendationResults.tsx`):**
  * Live connection to `POST /api/recommend`.
  * Dedicated display for **Best Direct Match** (Score, Institution, Rate, Tenure, Estimated Maturity, Reasons).
  * Highlighted **Close-Range Tenure Optimization** card showing delta maturity, delta tenure, and quantified trade-off explanation.
  * Table of **Other Suitable Options**.
  * Financial safety disclaimers prominently displayed on every recommendation view.
