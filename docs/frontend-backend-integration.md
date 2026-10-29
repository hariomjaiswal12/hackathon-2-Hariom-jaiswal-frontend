# CompanyIQ — Frontend & Backend Integration Plan

## Overview

This document defines the comprehensive architecture and endpoint mapping for integrating the CompanyIQ React/TypeScript frontend (`h2frontend`) with the completed Node.js/Express/MongoDB backend (`h2backend`).

The backend runs on `http://localhost:5000/api/v1` and Swagger documentation is available at `http://localhost:5000/api-docs`. The frontend runs with Vite at `http://localhost:5173`.

---

## 1. Feature to API Endpoint Mapping

| Frontend Feature | Frontend Component | Backend Endpoint | Method | Authentication | Status |
|---|---|---|---|---|---|
| **Authentication: Register** | `AuthModal` / `Header` | `/api/v1/auth/register` | `POST` | Public | Completed & Verified |
| **Authentication: Login** | `AuthModal` / `Header` | `/api/v1/auth/login` | `POST` | Public | Completed & Verified |
| **Authentication: Current Profile** | `AppContext` / `Header` | `/api/v1/auth/me` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Authentication: Token Refresh** | `apiClient` interceptor | `/api/v1/auth/refresh` | `POST` | Public (`refreshToken`) | Completed & Verified |
| **Authentication: Logout** | `Header` / `SettingsPage` | `/api/v1/auth/logout` | `POST` | Required (`Bearer`) | Completed & Verified |
| **Overview / Dashboard** | `DashboardPage` | `/api/v1/dashboard` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Explore Companies: List & Search** | `ExplorePage` | `/api/v1/companies` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Company Details** | `CompanyIntelligencePage` | `/api/v1/companies/:companyId` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Company Intelligence Deep Dive** | `CategoryDeepDivePage` | `/api/v1/companies/:companyId` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Evidence** | `EvidenceDrawer`, `CategoryDeepDivePage` | `/api/v1/companies/:companyId/evidence` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Data Sources** | `DataSourcesPage`, `EvidenceDrawer` | `/api/v1/companies/:companyId/sources` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Review Insights** | `ReviewInsightsPage` | `/api/v1/companies/:companyId/review-insights` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Career DNA: Get Profile** | `CareerDNAProfilePage`, `CareerDNABuilderPage` | `/api/v1/career-dna` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Career DNA: Save / Update Profile** | `CareerDNABuilderPage`, `CareerDNAProfilePage` | `/api/v1/career-dna` | `PUT` / `POST` | Required (`Bearer`) | Completed & Verified |
| **Career DNA: Reset Profile** | `CareerDNAProfilePage`, `SettingsPage` | `/api/v1/career-dna` | `DELETE` | Required (`Bearer`) | Completed & Verified |
| **Career Fit: All Company Matches** | `CareerFitPage` | `/api/v1/career-fit` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Career Fit: Single Company** | `CompanyIntelligencePage` | `/api/v1/career-fit/:companyId` | `GET` | Required (`Bearer`) | Completed & Verified |
| **What-If Simulator** | `WhatIfSimulatorPage` | `/api/v1/scenarios/calculate` | `POST` | Optional / Required | Completed & Verified |
| **Company Comparison: Calculate** | `ComparePage`, `BattleModePage` | `/api/v1/comparisons/calculate` | `POST` | Optional / Required | Completed & Verified |
| **Saved Comparisons: List** | `SavedComparisonsPage` | `/api/v1/comparisons` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Saved Comparisons: Save Scenario** | `ComparePage`, `WhatIfSimulatorPage` | `/api/v1/comparisons` | `POST` | Required (`Bearer`) | Completed & Verified |
| **Saved Comparisons: Remove Scenario** | `SavedComparisonsPage` | `/api/v1/comparisons/:id` | `DELETE` | Required (`Bearer`) | Completed & Verified |
| **Saved Companies: List** | `SavedCompaniesPage`, `AppContext` | `/api/v1/saved-companies` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Saved Companies: Add** | `CompanyCard`, `ExplorePage`, `CompanyIntelligencePage` | `/api/v1/saved-companies/:companyId` | `POST` | Required (`Bearer`) | Completed & Verified |
| **Saved Companies: Remove** | `SavedCompaniesPage`, `CompanyCard` | `/api/v1/saved-companies/:companyId` | `DELETE` | Required (`Bearer`) | Completed & Verified |
| **Research History: List** | `ResearchHistoryPage`, `DashboardPage` | `/api/v1/history` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Research History: Clear** | `ResearchHistoryPage`, `SettingsPage` | `/api/v1/history` | `DELETE` | Required (`Bearer`) | Completed & Verified |
| **Ask CompanyIQ: Ask Question** | `AskCompanyIQPage`, `ContextualAIDrawer` | `/api/v1/ai/ask` | `POST` | Optional (`Bearer`) | Completed & Verified |
| **Ask CompanyIQ: Get Threads** | `AskCompanyIQPage` | `/api/v1/ai/threads` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Alerts: List** | `AlertsPage` | `/api/v1/alerts` | `GET` | Optional (`Bearer`) | Completed & Verified |
| **Alerts: Mark Read** | `AlertsPage` | `/api/v1/alerts/:id/read` | `PATCH` | Required (`Bearer`) | Completed & Verified |
| **Watchlist: List** | `AlertsPage` | `/api/v1/watchlist` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Watchlist: Add** | `AlertsPage` | `/api/v1/watchlist/:companyId` | `POST` | Required (`Bearer`) | Completed & Verified |
| **Watchlist: Remove** | `AlertsPage` | `/api/v1/watchlist/:companyId` | `DELETE` | Required (`Bearer`) | Completed & Verified |
| **Settings: Get Settings** | `SettingsPage` | `/api/v1/settings` | `GET` | Required (`Bearer`) | Completed & Verified |
| **Settings: Update Settings** | `SettingsPage` | `/api/v1/settings` | `PUT` | Required (`Bearer`) | Completed & Verified |
| **Settings: Clear History** | `SettingsPage` | `/api/v1/settings/history` | `DELETE` | Required (`Bearer`) | Completed & Verified |
| **Settings: Reset Career DNA** | `SettingsPage` | `/api/v1/settings/career-dna` | `DELETE` | Required (`Bearer`) | Completed & Verified |

---

## 2. Core Architectural Separation Rules

1. **Company Intelligence vs Career Fit**:
   - Company Intelligence answers: *"What does empirical workplace evidence say about the company?"* (Overall Score, Categories, Evidence count, Confidence level, Sources). This is independent of the user's personal preferences.
   - Career Fit answers: *"How closely does this company align with the user's personal Career DNA priorities?"* (Fit Score %, Match Tier, Personal alignment breakdown).
   - Changing Career DNA or running a What-If scenario modifies Career Fit, but **never** modifies Company Intelligence scores.

2. **What-If Simulation Non-Destructive Invariant**:
   - The What-If Simulator invokes `POST /api/v1/scenarios/calculate` passing scenario-specific priorities.
   - It computes delta rankings against the baseline saved in MongoDB.
   - The simulator **never** overwrites the saved Career DNA. When navigating back or reloading, saved Career DNA remains intact.

3. **Authentication State Management**:
   - `apiClient` manages JWT access tokens and refresh tokens in `localStorage`.
   - Authorization headers (`Bearer <token>`) are automatically attached to outgoing requests.
   - Automatic token refresh on 401 response using `POST /api/v1/auth/refresh`.
   - On initial load, `AppContext` hydrates authenticated session by querying `GET /api/v1/auth/me`. If not logged in, demo user `hariom@example.com` can be seamlessly authenticated or selected to enable full interactive testing.

4. **Realistic Fallback and Error Handling**:
   - Loading states, empty states, and descriptive error messages across all pages.
   - If AI response indicates "Insufficient data", display transparently without frontend fabrication.

---

## 3. End-to-End Verification Results

1. **Authentication**: `POST /auth/login` and `GET /auth/me` with demo user `hariom@example.com` verified. Bearer token attached to all protected requests.
2. **Dashboard**: `GET /dashboard` populates live stats, Career DNA status, saved companies, and activity metrics.
3. **Explore Companies**: `GET /companies?search=TCS` and `GET /companies?search=Microsoft` return live server-side search results and pagination.
4. **Company Intelligence & Evidence**: `GET /companies/tcs`, `/evidence`, `/sources`, and `/review-insights` supply grounded themes, sentiment breakdowns, and confidence indicators.
5. **Career Fit Verification**:
   - Accenture: **91%**
   - TCS: **87%**
   - Infosys: **83%**
6. **What-If Simulator Verification**:
   - Work-Life Balance: 75 -> 100 simulation yields:
     1. Infosys: **91%** (+8 pts, Rank 1)
     2. TCS: **86%** (-1 pts, Rank 2)
     3. Accenture: **77%** (-14 pts, Rank 3)
   - Career DNA in MongoDB verified strictly preserved at baseline WLB = **75**.
7. **Comparisons**: 2-company and 3-company comparison calculations verified.
8. **Watchlist & Alerts**: Seeded score and freshness alerts displayed and actionable with `PATCH /alerts/:id/read`.
9. **Settings**: Profile, research preferences, and notification preferences loaded from `GET /settings` and persisted to `PUT /settings`.
10. **Build & Quality**: Zero TypeScript errors (`tsc -b && vite build` built in 1.74s). All 23 backend tests passing.
