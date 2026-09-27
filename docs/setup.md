# Setup & Deployment Guide

## Prerequisites
* Node.js v20.x or higher
* npm v9.x or higher

## Local Development Setup

1. **Clone & Install Dependencies**
   ```bash
   git clone <repo-url>
   cd mediconnect-ai
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   JWT_SECRET="mediconnect-ai-super-secret-key-prod-college-2026"
   PORT=3000
   ```

3. **Launch Full-Stack Development Server**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000` with the Express API and Vite middleware seamlessly integrated.

4. **Production Build & Verification**
   ```bash
   npm run build
   npm start
   ```

## Demo Credentials
| Role | Email | Password |
|---|---|---|
| Patient | `patient@demo.com` | `Password123!` |
| Pharmacist | `pharmacist@demo.com` | `Password123!` |
| Doctor | `doctor@demo.com` | `Password123!` |
| Hospital Admin | `hospital@demo.com` | `Password123!` |
| System Admin | `admin@demo.com` | `Password123!` |

You can also use the top-bar **"Demo Roles Switcher"** to instantly test all 5 roles with a single click.
