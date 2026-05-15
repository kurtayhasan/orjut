# ORJUT AGTECH OS - MASTER CONTEXT

> **VERSION:** 2.0 (ENTERPRISE PRODUCTION FINAL)
> **LAST UPDATED:** May 2026
> **STATUS:** PRODUCTION READY
> **SINGLE SOURCE OF TRUTH:** This document is the ultimate reference for any AI agent or developer working on the Orjut platform.

## 1. TECH STACK & CORE ARCHITECTURE
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Mode by default, Premium UI/UX Apple-inspired philosophy)
- **Database / Auth:** Supabase (PostgreSQL, Row Level Security, RPCs)
- **PWA:** Fully Progressive Web App capable (Manifest, Service Workers)
- **State Management:** React Context API (`AppContext.tsx`)

## 2. DATABASE SCHEMA & SECURITY (Supabase)
All tables are strictly governed by **Row Level Security (RLS)** ensuring isolated multi-tenant architecture based on `org_id` (representing the Farm/Organization) or `user_id`.

**Core Tables:**
1. `profiles`: Global user data. Roles (`farmer`, `engineer`, `admin`), `is_premium` status.
2. `lands`: Core farm properties. Includes `size_decare`, `crop_type`, `environment_type` (açık tarla/sera), `boundaries` (GeoJSON).
3. `inventory`: Farm supplies. Type (`fertilizer`, `seed`, `pesticide`, etc.), `quantity`, `unit_cost`.
4. `transactions`: Financial tracking. Connected to `land_id` or `season_id`. Supports `expense` and `income`.
5. `field_operations`: Actions applied to lands. Decrements `inventory`.
6. `scouting_logs`: Agronomist observations. Includes `health_status`, `growth_stage`, `prescription_action`.
7. `irrigation_logs`: Water usage tracking (`amount`, `unit`, `method`).
8. `audit_logs`: (Phase 2 Enterprise) Mandatory legal traceability for all `DELETE` and `UPDATE` events on critical tables.

## 3. CORE WORKFLOWS (İş Kuralları)

### A. Atomic Hybrid Inventory-Finance Loop
- **Rule:** Purchasing inventory and applying it to a field MUST be transactionally secure.
- **RPC:** `apply_expense_atomic` in Supabase natively prevents race conditions by using `FOR UPDATE` row locks before decrementing inventory and logging transactions.

### B. The Agronomist Loop (Teşhis-Reçete Döngüsü)
- **Engineer Role:** Agronomists log into the `engineer/page.tsx` dashboard, select a client (Farmer), and perform actions.
- **Workflow:** Engineer creates a `ScoutingLog` -> Sets `health_status` -> Suggests a `prescription_action`. The farmer views this, applies the prescription, and flags `is_prescription_applied = true`.

### C. RAG AI Token Optimization & Geo-Processing
- **Rule:** NEVER pass raw, high-density GeoJSON polygons to the LLM context.
- **Optimization:** Polygons drawn on `LeafletMap.tsx` are truncated to exactly 6 decimal places. Only the `lat`, `lng` (Centroid) and `soilType` are passed to the AI Action Engine alongside weather data to conserve tokens and reduce costs.

## 4. PREMIUM SYSTEM & MONETIZATION (Hasat Pro)
- **Package Name:** Hasat Pro (Rebranded from KOBİ Pro).
- **Pricing:** 99 TL/Month or 1.000 TL/Year.
- **Upsell Triggers:** Attempting to use advanced tools (AI RAG, Satellite NDVI/Moisture Overlays) triggers the `PremiumUpsellModal`.
- **Admin Approval:** Premium activations are tracked via `admin/page.tsx` where system administrators approve pending ETF/Wire payments.

## 5. UI/UX PHILOSOPHY (Kural 8 & Kural 9)
- **Rule 8 (Progressive Disclosure & Visual Data):** Avoid raw data dumps. Convert complex agronomic data (like NDVI or Soil Moisture) into highly readable progress bars and status badges (e.g., "%85 İyi Durumda"). Ensure empty states are ALWAYS handled with illustrations or guiding text. No "blank white screens" ever.
- **Rule 9 (Zero Silent Failures):** Every user action MUST return visual feedback. Use `sonner` Toasts for successes, warnings, and errors. A user must never wonder if an action succeeded.
- **Aesthetics:** Glassmorphism (`backdrop-blur`), refined Tailwind spacing, and dynamic dark mode transitions. No ugly Vercel logos (Favicon completely customized).

## 6. LEGAL COMPLIANCE
- Orjut integrates with **PayTR Sanal POS**.
- Mandatory compliance routes (`/legal/terms`, `/legal/privacy`, `/legal/distance-selling`, `/legal/refund`) are fully generated and permanently linked in the App Router.
- **Audit Logs** track changes for non-repudiation and enterprise accountability.

## 7. CRITICAL DEVELOPMENT DIRECTIVES (FOR FUTURE AGENTS)
1. Do not use generic terminal commands like `cat`, `grep`, or `sed` when internal sandbox tools exist.
2. If `psql` is unavailable locally, assume DB migrations will be applied manually by the user via the Supabase Dashboard.
3. State modifications MUST be performed against `db.ts` BEFORE updating UI context state (`AppContext.tsx`).
4. Always build standard `<a>` tags inside `<Link>` for internal routing to prevent full-page Next.js reloads. Dead links (`href="#"`) are strictly prohibited.
