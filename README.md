## Morning Roots Management System

A production-ready control panel for academies built with **Next.js (App Router)**, **Tailwind CSS v4**, **Framer Motion**, and **MongoDB**. The platform unifies admissions, fee collection, teacher HR, salary slips, and expense/profit tracking with secure authentication powered by NextAuth.

### ✨ Highlights
- **Secure login & password rotation** (bcrypt, NextAuth, session-aware middleware)
- **Student admissions**: intake form, searchable roster, edit/delete, automatic admission form generator
- **Fee management**: monthly fee submission, searchable ledgers, auto-generated fee slips, student-by-student history, outstanding totals
- **Teacher hub**: hiring form, status tracking, salary slip generation, payroll totals, mark/restore “left” staff
- **Expense intelligence**: manual expenses + auto teacher-salary expenses, profit snapshot, category insights, export-ready reports
- **Dashboards & reports**: animated overview cards, fee charts, expense pie, CSV export of KPIs

### 🛠 Tech Stack
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 + custom gradients
- Framer Motion, Recharts for UI polish
- MongoDB + Mongoose models
- NextAuth credentials provider
- SWR + React Hook Form + Zod validation

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Create an environment file
Copy `config/example.env` to `.env.local` and adjust as needed:

```
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster-url/morning-roots"
NEXTAUTH_SECRET="generate_a_long_random_string"
DEFAULT_ADMIN_EMAIL="admin@morningroots.com"
DEFAULT_ADMIN_PASSWORD="ChangeMe123!"
NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL="admin@morningroots.com"
```

- On first login the system will hash `DEFAULT_ADMIN_PASSWORD` and create `admin@morningroots.com` automatically.
- Update the password from the dashboard drawer (“Change password”) after signing in.

### 3. Run the dev server
```bash
npm run dev
```
Visit http://localhost:3000 — you’ll be redirected to `/login`.

### 4. (Optional) Seed demo data
Need sample students and teachers? Use the built-in seeder (requires your MongoDB connection to be available):
```bash
npm run seed
```
The script tops up the database to **100 students** and **20 teachers** with realistic placeholder information without touching any existing real entries beyond that.

### 5. Production build
```bash
npm run build
npm start
```

### 6. Quality
```bash
npm run lint
```

---

## Data Model Overview
- `User`: secure admin/staff credentials, password history timestamps
- `Student`: admission details, guardian info, fee amounts, status and timestamps
- `FeeRecord`: one-per-student per month ledger with slip numbers & payment metadata
- `Teacher`: CNIC, qualifications, salary, status, subjects, join/left dates
- `SalaryPayment`: unique monthly slips per teacher (auto logged as expense)
- `Expense`: teacher salary + operations/utilities/other outflows for profit calc

All collections run through a shared Mongo connection helper for Vercel friendliness.

---

## Deploying

### Quick Deploy to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Set up MongoDB Atlas** (free tier available):
   - Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user
   - Allow network access (0.0.0.0/0 for testing, or restrict to Vercel IPs)
   - Get your connection string

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and import your repository
   - Add these environment variables:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
     - `NEXTAUTH_URL` - Your Vercel app URL (update after first deploy)
     - `DEFAULT_ADMIN_EMAIL` - admin@morningroots.com
     - `DEFAULT_ADMIN_PASSWORD` - Your secure password
     - `NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL` - admin@morningroots.com
   - Click Deploy

4. **After deployment**:
   - Visit your app URL
   - Log in with the default admin credentials
   - **Change the password immediately** from the dashboard

📖 **For detailed step-by-step instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Extending
Ideas for future iterations:
- Role-based access (e.g., finance vs admissions)
- SMS/email notifications on fee slip generation
- Document uploads (B-form, CNIC scans)
- Audit log & analytics exports

Happy teaching! 🎓
