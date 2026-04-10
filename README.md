# Food Ordering Website — Fullstack Challenge

A role-based food ordering platform built with **NestJS** (Backend) and **Next.js** (Frontend).

## Features
- **Role-Based Access Control (RBAC)**: Admin, Manager, and Member roles with specific permissions.
- **Relational Access Control (Re-BAC)**: Data isolation by country (India/America).
- **GraphQL API**: Powered by Apollo Server and Prisma.
- **Mock Login**: Simulate different user roles and regions via a dropdown in the UI.

---

## Prerequisites
- Node.js (v20+)
- npm

## Getting Started

### 1. Backend Setup (NestJS)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment:
   ```bash
   cp .env.example .env
   ```
4. Initialize the database and seed data:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Start the backend:
   ```bash
   npm run start:dev
   ```
   *The backend will run on http://localhost:3005*

### 2. Frontend Setup (Next.js)
1. Navigate to the frontend folder (in a new terminal):
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:3000*

---

## Evaluation Keys
- **RBAC**: Members cannot checkout or cancel orders.
- **Re-BAC**: Switching to a user from a different country filters restaurants and orders automatically.
- **Architecture**: Decoupled Apollo Client logic to ensure high performance and reliability across Next.js 16/19 rendering cycles.
